from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def create_invoice():
    filename = "enterprise_invoice.pdf"
    doc = SimpleDocTemplate(
        filename, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40
    )
    story = []

    styles = getSampleStyleSheet()

    # Custom Styles
    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Heading1"],
        fontSize=20,
        textColor=colors.HexColor("#1A365D"),
        alignment=1,  # Center
        spaceAfter=5,
    )

    subtitle_style = ParagraphStyle(
        "SubtitleStyle",
        parent=styles["Normal"],
        fontSize=9,
        textColor=colors.HexColor("#4A5568"),
        alignment=1,
        spaceAfter=15,
    )

    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontSize=11,
        textColor=colors.HexColor("#2B6CB0"),
        spaceBefore=10,
        spaceAfter=5,
    )

    normal_style = ParagraphStyle(
        "NormalStyle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=colors.HexColor("#2D3748"),
        spaceAfter=3,
    )

    bold_style = ParagraphStyle(
        "BoldStyle",
        parent=styles["Normal"],
        fontSize=10,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#1A202C"),
    )

    # Header
    story.append(Paragraph("<b>GLOBAL TECH CORP LTD.</b>", title_style))
    story.append(
        Paragraph(
            "122/B, Gulshan Avenue, Dhaka-1212, Bangladesh<br/>BIN: 000987654-0101 | VAT Reg: 458921",
            subtitle_style,
        )
    )
    story.append(
        HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2B6CB0"), spaceAfter=15)
    )

    # Invoice Meta Info Table
    meta_data = [
        [
            Paragraph("<b>Invoice No:</b> GTC-INV-2026-9842", normal_style),
            Paragraph("<b>Invoice Date:</b> October 30, 2026", normal_style),
        ],
        [
            Paragraph("<b>PO Number:</b> PO-99281-XYZ", normal_style),
            Paragraph("<b>Due Date:</b> November 30, 2026", normal_style),
        ],
        [Paragraph("<b>Currency:</b> USD", normal_style), Paragraph("", normal_style)],
    ]
    meta_table = Table(meta_data, colWidths=[260, 260])
    meta_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # Client & Supplier Info
    party_data = [
        [
            Paragraph("<b>BILL TO:</b>", section_heading),
            Paragraph("<b>SHIP TO:</b>", section_heading),
        ],
        [
            Paragraph(
                "<b>Nordic Solutions AB</b><br/>Attn: Erik Lindqvist<br/>Sveavägen 44, 111 34 Stockholm, Sweden<br/>Tax ID: SE556677889901",
                normal_style,
            ),
            Paragraph(
                "<b>Helsinki Tech Hub</b><br/>Mannerheimintie 12<br/>00100 Helsinki, Finland",
                normal_style,
            ),
        ],
    ]
    party_table = Table(party_data, colWidths=[260, 260])
    party_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F7FAFC")),
                ("PADDING", (0, 0), (-1, -1), 8),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ]
        )
    )
    story.append(party_table)
    story.append(Spacer(1, 15))

    # Line Items Table
    table_data = [
        ["Item #", "Description", "Qty", "Unit Price", "Discount", "Total"],
        ["ITM-01", "Cloud Infrastructure Setup", "1", "$2,500.00", "$100.00", "$2,400.00"],
        ["ITM-02", "FastAPI Microservices Dev", "4", "$600.00", "$0.00", "$2,400.00"],
        ["ITM-03", "n8n AI Workflow Automation", "2", "$1,250.00", "$250.00", "$2,250.00"],
        ["ITM-04", "Docker & Linux Deployment", "1", "$800.00", "$0.00", "$800.00"],
    ]

    t = Table(table_data, colWidths=[55, 185, 40, 75, 75, 90])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2B6CB0")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 9),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("ALIGN", (1, 1), (1, -1), "LEFT"),  # Description left aligned
                ("ALIGN", (5, 1), (5, -1), "RIGHT"),  # Total right aligned
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E0")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
            ]
        )
    )
    story.append(t)
    story.append(Spacer(1, 15))

    # Financial Summary
    summary_data = [
        ["Subtotal:", "$7,850.00"],
        ["Global Discount (5%):", "$392.50"],
        ["Net Subtotal:", "$7,457.50"],
        ["VAT / Tax (15%):", "$1,118.63"],
        ["Shipping & Handling:", "$150.00"],
        ["TOTAL AMOUNT DUE:", "$8,726.13 USD"],
    ]

    summary_table = Table(summary_data, colWidths=[380, 140])
    summary_table.setStyle(
        TableStyle(
            [
                ("ALIGN", (0, 0), (0, -1), "RIGHT"),
                ("ALIGN", (1, 0), (1, -1), "RIGHT"),
                ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
                ("TEXTCOLOR", (0, -1), (-1, -1), colors.HexColor("#1A365D")),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("LINEABOVE", (0, -1), (-1, -1), 1, colors.HexColor("#1A365D")),
            ]
        )
    )
    story.append(summary_table)
    story.append(Spacer(1, 20))

    # Payment Instructions & Footer
    story.append(Paragraph("<b>Payment Instructions:</b>", section_heading))
    story.append(
        Paragraph(
            "Bank Name: Standard Chartered Bank, Dhaka Branch<br/>SWIFT Code: SCBLBDDX | A/C Number: 01-1234567-02",
            normal_style,
        )
    )
    story.append(Spacer(1, 10))
    story.append(
        Paragraph(
            "<i>Note: Please include invoice number in wire transfer description. Thank you for your business!</i>",
            subtitle_style,
        )
    )

    doc.build(story)
    print("Enterprise PDF Invoice generated successfully as 'enterprise_invoice.pdf'!")


if __name__ == "__main__":
    create_invoice()
