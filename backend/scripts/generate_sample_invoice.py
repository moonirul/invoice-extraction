
import os
from decimal import Decimal, ROUND_HALF_UP
from datetime import date

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_RIGHT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable
)


# =====================================================
# CONFIGURATION
# =====================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

OUTPUT_FILE = os.path.join(
    BASE_DIR,
    "UT_Austin_Thesis_Project_Invoice.pdf"
)


# =====================================================
# SUPPLIER INFORMATION (FICTIONAL)
# =====================================================

COMPANY = {
    "name": "ACADEMIC RESEARCH SOLUTIONS LLC",
    "address": "1201 Main Street, Suite 1500",
    "city": "Dallas, TX 75202, USA",
    "email": "accounts@academicresearch.example",
    "phone": "+1 (214) 555-0148",
    "website": "www.academicresearch.example",
}


# =====================================================
# CLIENT INFORMATION
# =====================================================

CLIENT = {
    "name": "The University of Texas at Austin",
    "department": "Department of Computer Science",
    "address": "2317 Speedway, Stop D9500",
    "city": "Austin, TX 78712, USA",
    "student_id": "UT-2026-014",
}


# =====================================================
# PROJECT INFORMATION
# =====================================================

PROJECT = {
    "title": (
        "AI-Based Smart Traffic Management "
        "System Using Machine Learning"
    ),
    "project_id": "UT-CS-THS-2026-014",
    "program": "Master of Science in Computer Science",
    "semester": "Fall 2026",
    "research_area": "Artificial Intelligence",
    "technology": "Python, TensorFlow, OpenCV, FastAPI",
}


# =====================================================
# INVOICE INFORMATION
# =====================================================

INVOICE = {
    "number": "ARS-USA-2026-014",
    "po_number": "PO-UT-2026-014",
    "issue_date": date(2026, 11, 1),
    "due_date": date(2026, 11, 30),
    "currency": "USD",
    "payment_terms": "Net 30 Days",
}


# =====================================================
# SERVICE ITEMS
# =====================================================

ITEMS = [
    {
        "code": "TH-001",
        "description": "Research Proposal & Project Planning",
        "qty": 1,
        "price": Decimal("150.00"),
    },
    {
        "code": "TH-002",
        "description": "Literature Review & Related Research",
        "qty": 1,
        "price": Decimal("200.00"),
    },
    {
        "code": "TH-003",
        "description": "Machine Learning Model Development",
        "qty": 1,
        "price": Decimal("350.00"),
    },
    {
        "code": "TH-004",
        "description": "System Implementation & Integration",
        "qty": 1,
        "price": Decimal("250.00"),
    },
    {
        "code": "TH-005",
        "description": "Testing & Performance Evaluation",
        "qty": 1,
        "price": Decimal("150.00"),
    },
    {
        "code": "TH-006",
        "description": "Technical Documentation & Consultation",
        "qty": 1,
        "price": Decimal("150.00"),
    },
]


# =====================================================
# FINANCIAL CALCULATIONS
# =====================================================

DISCOUNT_RATE = Decimal("0.00")
TAX_RATE = Decimal("0.00")
SHIPPING = Decimal("0.00")


def money(value):
    return Decimal(str(value)).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP
    )


def usd(value):
    return f"${money(value):,.2f}"


subtotal = money(
    sum(
        item["qty"] * item["price"]
        for item in ITEMS
    )
)

discount = money(subtotal * DISCOUNT_RATE)

net_subtotal = money(subtotal - discount)

tax = money(net_subtotal * TAX_RATE)

total = money(net_subtotal + tax + SHIPPING)


# =====================================================
# PDF GENERATOR
# =====================================================

def create_invoice():

    print("\nStarting invoice generation...")

    doc = SimpleDocTemplate(
        OUTPUT_FILE,
        pagesize=letter,
        rightMargin=38,
        leftMargin=38,
        topMargin=35,
        bottomMargin=35,
        title="Academic Research Project Invoice",
        author=COMPANY["name"],
    )

    story = []
    styles = getSampleStyleSheet()

    # Colors
    navy = colors.HexColor("#17365D")
    blue = colors.HexColor("#2874A6")
    light_blue = colors.HexColor("#EBF4FF")
    light_grey = colors.HexColor("#F7FAFC")
    border = colors.HexColor("#CBD5E1")
    dark = colors.HexColor("#1E293B")
    grey = colors.HexColor("#64748B")

    # Styles
    normal = ParagraphStyle(
        "NormalCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=13,
        textColor=dark,
    )

    small = ParagraphStyle(
        "SmallCustom",
        parent=normal,
        fontSize=7.5,
        leading=11,
        textColor=grey,
    )

    heading = ParagraphStyle(
        "HeadingCustom",
        parent=styles["Heading2"],
        fontSize=10,
        fontName="Helvetica-Bold",
        textColor=blue,
        spaceBefore=8,
        spaceAfter=7,
    )

    invoice_title = ParagraphStyle(
        "InvoiceTitle",
        parent=styles["Heading1"],
        fontSize=22,
        fontName="Helvetica-Bold",
        textColor=navy,
        alignment=TA_RIGHT,
    )

    footer = ParagraphStyle(
        "Footer",
        parent=small,
        alignment=TA_CENTER,
        leading=13,
    )

    # =================================================
    # HEADER
    # =================================================

    header_data = [[
        Paragraph(
            f"<b>{COMPANY['name']}</b><br/>"
            f"{COMPANY['address']}<br/>"
            f"{COMPANY['city']}<br/>"
            f"Email: {COMPANY['email']}<br/>"
            f"Phone: {COMPANY['phone']}",
            normal
        ),
        Paragraph(
            "INVOICE<br/>"
            "<font size='9' color='#64748B'>"
            "ACADEMIC RESEARCH PROJECT"
            "</font>",
            invoice_title
        )
    ]]

    header = Table(
        header_data,
        colWidths=[310, 210]
    )

    header.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
    ]))

    story.append(header)
    story.append(Spacer(1, 12))

    story.append(HRFlowable(
        width="100%",
        thickness=2,
        color=blue,
        spaceAfter=15
    ))

    # =================================================
    # INVOICE METADATA
    # =================================================

    meta_data = [
        [
            Paragraph("<b>Invoice Number</b>", small),
            Paragraph("<b>Invoice Date</b>", small),
            Paragraph("<b>Due Date</b>", small),
        ],
        [
            INVOICE["number"],
            INVOICE["issue_date"].strftime("%B %d, %Y"),
            INVOICE["due_date"].strftime("%B %d, %Y"),
        ],
        [
            Paragraph("<b>PO Number</b>", small),
            Paragraph("<b>Currency</b>", small),
            Paragraph("<b>Payment Terms</b>", small),
        ],
        [
            INVOICE["po_number"],
            INVOICE["currency"],
            INVOICE["payment_terms"],
        ],
    ]

    meta = Table(
        meta_data,
        colWidths=[173, 173, 174]
    )

    meta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), light_grey),
        ("BOX", (0, 0), (-1, -1), 0.5, border),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("PADDING", (0, 0), (-1, -1), 8),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
    ]))

    story.append(meta)
    story.append(Spacer(1, 18))

    # =================================================
    # CLIENT & PROJECT
    # =================================================

    party_data = [
        [
            Paragraph("<b>BILL TO</b>", heading),
            Paragraph("<b>PROJECT INFORMATION</b>", heading),
        ],
        [
            Paragraph(
                f"<b>{CLIENT['name']}</b><br/>"
                f"{CLIENT['department']}<br/>"
                f"{CLIENT['address']}<br/>"
                f"{CLIENT['city']}<br/>"
                f"Student Reference: {CLIENT['student_id']}",
                normal
            ),
            Paragraph(
                f"<b>{PROJECT['title']}</b><br/>"
                f"Project ID: {PROJECT['project_id']}<br/>"
                f"Program: {PROJECT['program']}<br/>"
                f"Semester: {PROJECT['semester']}<br/>"
                f"Research Area: {PROJECT['research_area']}<br/>"
                f"Technology: {PROJECT['technology']}",
                normal
            ),
        ],
    ]

    parties = Table(
        party_data,
        colWidths=[260, 260]
    )

    parties.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), light_blue),
        ("BOX", (0, 0), (-1, -1), 0.5, border),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("PADDING", (0, 0), (-1, -1), 10),
    ]))

    story.append(parties)
    story.append(Spacer(1, 20))

    # =================================================
    # SERVICE DETAILS
    # =================================================

    story.append(
        Paragraph("PROJECT SERVICE DETAILS", heading)
    )

    table_data = [[
        "Item #",
        "Description",
        "Qty",
        "Unit Price",
        "Amount",
    ]]

    for item in ITEMS:

        amount = money(
            item["qty"] * item["price"]
        )

        table_data.append([
            item["code"],
            Paragraph(item["description"], normal),
            str(item["qty"]),
            usd(item["price"]),
            usd(amount),
        ])

    services = Table(
        table_data,
        colWidths=[55, 215, 35, 105, 110],
        repeatRows=1
    )

    services.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), navy),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 8),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.5, border),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1),
         [colors.white, light_grey]),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))

    story.append(services)
    story.append(Spacer(1, 18))

    # =================================================
    # FINANCIAL SUMMARY
    # =================================================

    summary_data = [
        ["Subtotal:", usd(subtotal)],
        ["Discount:", f"- {usd(discount)}"],
        ["Net Subtotal:", usd(net_subtotal)],
        ["Sales Tax (0% sample):", usd(tax)],
        ["TOTAL AMOUNT DUE:", usd(total)],
    ]

    summary = Table(
        summary_data,
        colWidths=[370, 150]
    )

    summary.setStyle(TableStyle([
        ("ALIGN", (0, 0), (-1, -1), "RIGHT"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LINEABOVE", (0, -1), (-1, -1), 1.5, navy),
        ("BACKGROUND", (0, -1), (-1, -1), light_blue),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("TEXTCOLOR", (0, -1), (-1, -1), navy),
        ("FONTSIZE", (0, -1), (-1, -1), 12),
    ]))

    story.append(summary)
    story.append(Spacer(1, 20))

    # =================================================
    # PAYMENT INSTRUCTIONS
    # =================================================

    story.append(
        Paragraph("PAYMENT INSTRUCTIONS", heading)
    )

    payment_text = (
        "<b>Payment Method:</b> Bank Transfer<br/>"
        "<b>Bank:</b> Sample Commercial Bank<br/>"
        "<b>Account Name:</b> Academic Research Solutions LLC<br/>"
        "<b>Account Number:</b> SAMPLE-ACCOUNT-001<br/>"
        "<b>Routing Number:</b> SAMPLE-ROUTING-001<br/>"
        "<b>Payment Reference:</b> ARS-USA-2026-014"
    )

    story.append(
        Paragraph(payment_text, normal)
    )

    story.append(Spacer(1, 15))

    # =================================================
    # TERMS
    # =================================================

    story.append(
        Paragraph("TERMS & CONDITIONS", heading)
    )

    terms = (
        "1. This is an illustrative academic research consultancy invoice.<br/>"
        "2. Payment terms are Net 30 Days from the invoice date.<br/>"
        "3. Additional services require separate approval.<br/>"
        "4. Deliverables are subject to the agreed project scope.<br/>"
        "5. Academic work must comply with applicable academic "
        "integrity policies."
    )

    story.append(
        Paragraph(terms, small)
    )

    story.append(Spacer(1, 22))

    # =================================================
    # FOOTER
    # =================================================

    story.append(HRFlowable(
        width="100%",
        thickness=0.7,
        color=border,
        spaceAfter=10
    ))

    story.append(
        Paragraph(
            "<b>THANK YOU FOR YOUR BUSINESS!</b><br/>"
            f"{COMPANY['name']}<br/>"
            f"{COMPANY['website']}<br/><br/>"
            "FICTIONAL SAMPLE DOCUMENT - NOT ISSUED OR "
            "ENDORSED BY THE UNIVERSITY OF TEXAS AT AUSTIN.<br/>"
            "Not valid as proof of payment or an official tax invoice.",
            footer
        )
    )

    # =================================================
    # BUILD PDF
    # =================================================

    doc.build(story)

    # Verify generated PDF

    if not os.path.isfile(OUTPUT_FILE):
        raise FileNotFoundError(
            "PDF generation failed: output file not found."
        )

    print("\n" + "=" * 55)
    print("INVOICE GENERATED SUCCESSFULLY!")
    print("=" * 55)

    print("Invoice:", INVOICE["number"])
    print("University:", CLIENT["name"])
    print("Project:", PROJECT["title"])
    print("Subtotal:", usd(subtotal))
    print("Total:", usd(total))
    print("File:", OUTPUT_FILE)
    print("Location:", os.path.abspath(OUTPUT_FILE))
    print("Size:", os.path.getsize(OUTPUT_FILE), "bytes")

    print("=" * 55)

    # Open PDF automatically on Windows

    if os.name == "nt":
        try:
            os.startfile(OUTPUT_FILE)
            print("PDF opened in Windows!")
        except OSError as error:
            print("Auto-open failed:", error)


# =====================================================
# MAIN ENTRY POINT
# =====================================================

if __name__ == "__main__":

    try:
        create_invoice()

    except Exception as error:

        print("\nINVOICE GENERATION ERROR:")
        print(str(error))

        raise
