import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Trash2,
  Download,
  Printer,
  Upload,
  FileText,
} from "lucide-react";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  companyName: string;
  companyLogo: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItem[];
  notes: string;
  tax: number;
}

export default function Index() {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [invoice, setInvoice] = useState<InvoiceData>({
    companyName: "Your Company Name",
    companyLogo: "",
    companyAddress: "123 Business Street\nCity, State 12345",
    companyPhone: "(555) 123-4567",
    companyEmail: "contact@company.com",
    clientName: "Client Name",
    clientAddress: "456 Client Avenue\nCity, State 67890",
    clientPhone: "(555) 987-6543",
    clientEmail: "client@email.com",
    invoiceNumber: "INV-001",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    items: [
      {
        id: "1",
        description: "Web Development Services",
        quantity: 1,
        rate: 1500,
        amount: 1500,
      },
    ],
    notes: "Thank you for your business!",
    tax: 10,
  });

  const handleInputChange = (
    field: keyof InvoiceData,
    value: string | number,
  ) => {
    setInvoice((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number,
  ) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === "quantity" || field === "rate") {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      }),
    }));
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setInvoice((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (id: string) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setInvoice((prev) => ({
          ...prev,
          companyLogo: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subtotal * invoice.tax) / 100;
  const total = subtotal + taxAmount;

  const downloadPDF = async () => {
    if (invoiceRef.current) {
      try {
        const canvas = await html2canvas(invoiceRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
      } catch (error) {
        console.error("Error generating PDF:", error);
      }
    }
  };

  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Invoice Generator
                </h1>
                <p className="text-slate-600">
                  Create professional invoices instantly
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={printInvoice} variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                onClick={downloadPDF}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Panel */}
          <div className="space-y-6">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={invoice.companyName}
                    onChange={(e) =>
                      handleInputChange("companyName", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="logo">Company Logo</Label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("logo")?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                    {invoice.companyLogo && (
                      <img
                        src={invoice.companyLogo}
                        alt="Logo"
                        className="h-8 w-8 object-contain"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="companyAddress">Address</Label>
                  <Textarea
                    id="companyAddress"
                    value={invoice.companyAddress}
                    onChange={(e) =>
                      handleInputChange("companyAddress", e.target.value)
                    }
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyPhone">Phone</Label>
                    <Input
                      id="companyPhone"
                      value={invoice.companyPhone}
                      onChange={(e) =>
                        handleInputChange("companyPhone", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyEmail">Email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={invoice.companyEmail}
                      onChange={(e) =>
                        handleInputChange("companyEmail", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={invoice.clientName}
                    onChange={(e) =>
                      handleInputChange("clientName", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="clientAddress">Address</Label>
                  <Textarea
                    id="clientAddress"
                    value={invoice.clientAddress}
                    onChange={(e) =>
                      handleInputChange("clientAddress", e.target.value)
                    }
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientPhone">Phone</Label>
                    <Input
                      id="clientPhone"
                      value={invoice.clientPhone}
                      onChange={(e) =>
                        handleInputChange("clientPhone", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={invoice.clientEmail}
                      onChange={(e) =>
                        handleInputChange("clientEmail", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Invoice Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input
                      id="invoiceNumber"
                      value={invoice.invoiceNumber}
                      onChange={(e) =>
                        handleInputChange("invoiceNumber", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="invoiceDate">Invoice Date</Label>
                    <Input
                      id="invoiceDate"
                      type="date"
                      value={invoice.invoiceDate}
                      onChange={(e) =>
                        handleInputChange("invoiceDate", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={invoice.dueDate}
                      onChange={(e) =>
                        handleInputChange("dueDate", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Items
                  </CardTitle>
                  <Button onClick={addItem} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {invoice.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 items-end"
                  >
                    <div className="col-span-5">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "description",
                            e.target.value,
                          )
                        }
                        placeholder="Service/Product description"
                        className="mt-1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Qty</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "quantity",
                            Number(e.target.value),
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Rate</Label>
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "rate",
                            Number(e.target.value),
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Amount</Label>
                      <Input
                        value={`$${item.amount.toFixed(2)}`}
                        readOnly
                        className="mt-1 bg-slate-50"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        onClick={() => removeItem(item.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tax">Tax (%)</Label>
                      <Input
                        id="tax"
                        type="number"
                        value={invoice.tax}
                        onChange={(e) =>
                          handleInputChange("tax", Number(e.target.value))
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={invoice.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    className="mt-1"
                    rows={3}
                    placeholder="Additional notes or payment terms..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Invoice Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={invoiceRef}
                  className="bg-white p-8 shadow-lg rounded-lg"
                  style={{ minHeight: "800px" }}
                >
                  {/* Invoice Header */}
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      {invoice.companyLogo && (
                        <img
                          src={invoice.companyLogo}
                          alt="Company Logo"
                          className="h-16 w-16 object-contain"
                        />
                      )}
                      <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                          {invoice.companyName}
                        </h1>
                        <div className="text-sm text-slate-600 mt-1 whitespace-pre-line">
                          {invoice.companyAddress}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <h2 className="text-3xl font-bold text-blue-600">
                        INVOICE
                      </h2>
                      <div className="text-sm text-slate-600 mt-2">
                        <p>
                          <strong>Invoice #:</strong> {invoice.invoiceNumber}
                        </p>
                        <p>
                          <strong>Date:</strong>{" "}
                          {new Date(invoice.invoiceDate).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Due Date:</strong>{" "}
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Company Contact Info */}
                  <div className="mb-8">
                    <div className="text-sm text-slate-600">
                      <p>
                        {invoice.companyPhone} • {invoice.companyEmail}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-8" />

                  {/* Bill To */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                      Bill To:
                    </h3>
                    <div className="text-slate-700">
                      <p className="font-medium text-lg">
                        {invoice.clientName}
                      </p>
                      <div className="text-sm mt-2 whitespace-pre-line">
                        {invoice.clientAddress}
                      </div>
                      <div className="text-sm mt-2">
                        <p>{invoice.clientPhone}</p>
                        <p>{invoice.clientEmail}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="mb-8">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-slate-200">
                          <th className="text-left py-3 text-sm font-semibold text-slate-900">
                            Description
                          </th>
                          <th className="text-center py-3 text-sm font-semibold text-slate-900">
                            Qty
                          </th>
                          <th className="text-right py-3 text-sm font-semibold text-slate-900">
                            Rate
                          </th>
                          <th className="text-right py-3 text-sm font-semibold text-slate-900">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.items.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-slate-100"
                          >
                            <td className="py-3 text-sm text-slate-700">
                              {item.description}
                            </td>
                            <td className="py-3 text-center text-sm text-slate-700">
                              {item.quantity}
                            </td>
                            <td className="py-3 text-right text-sm text-slate-700">
                              ${item.rate.toFixed(2)}
                            </td>
                            <td className="py-3 text-right text-sm text-slate-700">
                              ${item.amount.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end mb-8">
                    <div className="w-64">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Subtotal:</span>
                          <span className="text-slate-900">
                            ${subtotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">
                            Tax ({invoice.tax}%):
                          </span>
                          <span className="text-slate-900">
                            ${taxAmount.toFixed(2)}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                          <span className="text-slate-900">Total:</span>
                          <span className="text-blue-600">
                            ${total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {invoice.notes && (
                    <div className="border-t border-slate-200 pt-8">
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">
                        Notes:
                      </h4>
                      <p className="text-sm text-slate-600 whitespace-pre-line">
                        {invoice.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
