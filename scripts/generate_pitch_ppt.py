from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from xml.sax.saxutils import escape
import zipfile


ROOT = Path("/home/shivang/AnonPay")
OUT = ROOT / "AnonPay_5_slide_pitch.pptx"

P_NS = "http://schemas.openxmlformats.org/presentationml/2006/main"
A_NS = "http://schemas.openxmlformats.org/drawingml/2006/main"
R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
CP_NS = "http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
DC_NS = "http://purl.org/dc/elements/1.1/"
DCTERMS_NS = "http://purl.org/dc/terms/"
XSI_NS = "http://www.w3.org/2001/XMLSchema-instance"
EP_NS = "http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
VT_NS = "http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"

SLIDE_W = 12192000
SLIDE_H = 6858000


def emu(x: float) -> int:
    return int(x * 914400)


def paragraph_xml(text: str, size: int = 2200, color: str = "D9D9D9", bold: bool = False) -> str:
    text = escape(text)
    b = ' b="1"' if bold else ""
    return (
        f'<a:p>'
        f'<a:pPr algn="l" marL="0" indent="0"/>'
        f'<a:r>'
        f'<a:rPr lang="en-US" sz="{size}"{b} dirty="0" smtClean="0">'
        f'<a:solidFill><a:srgbClr val="{color}"/></a:solidFill>'
        f'</a:rPr>'
        f'<a:t>{text}</a:t>'
        f'</a:r>'
        f'<a:endParaRPr lang="en-US" sz="{size}" dirty="0"/>'
        f'</a:p>'
    )


def text_box(shape_id: int, name: str, x: int, y: int, cx: int, cy: int, paragraphs: list[str]) -> str:
    return f"""
    <p:sp>
      <p:nvSpPr>
        <p:cNvPr id="{shape_id}" name="{escape(name)}"/>
        <p:cNvSpPr/>
        <p:nvPr/>
      </p:nvSpPr>
      <p:spPr>
        <a:xfrm>
          <a:off x="{x}" y="{y}"/>
          <a:ext cx="{cx}" cy="{cy}"/>
        </a:xfrm>
        <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        <a:noFill/>
        <a:ln><a:noFill/></a:ln>
      </p:spPr>
      <p:txBody>
        <a:bodyPr wrap="square" rtlCol="0" anchor="t"/>
        <a:lstStyle/>
        {''.join(paragraphs)}
      </p:txBody>
    </p:sp>
    """


def rect(shape_id: int, name: str, x: int, y: int, cx: int, cy: int, fill: str, line: str | None = None, radius: bool = False) -> str:
    prst = "roundRect" if radius else "rect"
    line_xml = (
        f'<a:ln w="19050"><a:solidFill><a:srgbClr val="{line or fill}"/></a:solidFill></a:ln>'
        if line
        else '<a:ln><a:noFill/></a:ln>'
    )
    return f"""
    <p:sp>
      <p:nvSpPr>
        <p:cNvPr id="{shape_id}" name="{escape(name)}"/>
        <p:cNvSpPr/>
        <p:nvPr/>
      </p:nvSpPr>
      <p:spPr>
        <a:xfrm>
          <a:off x="{x}" y="{y}"/>
          <a:ext cx="{cx}" cy="{cy}"/>
        </a:xfrm>
        <a:prstGeom prst="{prst}"><a:avLst/></a:prstGeom>
        <a:solidFill><a:srgbClr val="{fill}"/></a:solidFill>
        {line_xml}
      </p:spPr>
      <p:txBody>
        <a:bodyPr/>
        <a:lstStyle/>
        <a:p><a:endParaRPr lang="en-US"/></a:p>
      </p:txBody>
    </p:sp>
    """


def line(shape_id: int, name: str, x1: int, y1: int, x2: int, y2: int, color: str = "CFCFCF") -> str:
    return f"""
    <p:cxnSp>
      <p:nvCxnSpPr>
        <p:cNvPr id="{shape_id}" name="{escape(name)}"/>
        <p:cNvCxnSpPr/>
        <p:nvPr/>
      </p:nvCxnSpPr>
      <p:spPr>
        <a:xfrm>
          <a:off x="{x1}" y="{y1}"/>
          <a:ext cx="{x2 - x1}" cy="{y2 - y1}"/>
        </a:xfrm>
        <a:prstGeom prst="line"><a:avLst/></a:prstGeom>
        <a:ln w="25400">
          <a:solidFill><a:srgbClr val="{color}"/></a:solidFill>
          <a:tailEnd type="none"/>
          <a:headEnd type="triangle"/>
        </a:ln>
      </p:spPr>
    </p:cxnSp>
    """


def slide_xml(inner_shapes: str) -> str:
    bg = rect(1, "Background", 0, 0, SLIDE_W, SLIDE_H, "121212")
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="{A_NS}" xmlns:r="{R_NS}" xmlns:p="{P_NS}">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="0" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      {bg}
      {inner_shapes}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sld>
"""


def make_slides() -> list[str]:
    slides: list[str] = []

    slides.append(
        slide_xml(
            rect(2, "Accent", emu(0.7), emu(0.65), emu(0.18), emu(4.6), "7EFFCC")
            + text_box(3, "Title", emu(1.1), emu(0.9), emu(10.5), emu(1.0), [
                paragraph_xml("AnonPay", size=3000, color="F3F3F3", bold=True),
                paragraph_xml("Private invoicing and checkout on Midnight", size=1800, color="7EFFCC"),
            ])
            + text_box(4, "What", emu(1.1), emu(2.0), emu(10.4), emu(2.7), [
                paragraph_xml("What it does", size=2200, color="F3F3F3", bold=True),
                paragraph_xml("AnonPay lets merchants create payment links, invoices, and checkout pages for crypto payments with a privacy-first workflow.", size=1800),
                paragraph_xml("Users scan a QR or open a link, connect a Midnight wallet, and complete the payment flow without turning the product into a public revenue dashboard.", size=1800),
            ])
            + text_box(5, "Bottom", emu(1.1), emu(5.7), emu(10.0), emu(0.8), [
                paragraph_xml("Simple idea: make crypto payments usable for real merchants without exposing everything on a public ledger.", size=1700, color="BDBDBD")
            ])
        )
    )

    slides.append(
        slide_xml(
            text_box(2, "Title", emu(0.9), emu(0.8), emu(11.0), emu(0.8), [
                paragraph_xml("Problem it solves", size=2800, color="F3F3F3", bold=True),
            ])
            + rect(3, "Card1", emu(0.9), emu(1.9), emu(3.4), emu(2.7), "1A1A1A", "333333", True)
            + rect(4, "Card2", emu(4.15), emu(1.9), emu(3.4), emu(2.7), "1A1A1A", "333333", True)
            + rect(5, "Card3", emu(7.4), emu(1.9), emu(3.4), emu(2.7), "1A1A1A", "333333", True)
            + text_box(6, "P1", emu(1.15), emu(2.2), emu(2.9), emu(2.2), [
                paragraph_xml("Public ledgers expose business data", size=1800, color="7EFFCC", bold=True),
                paragraph_xml("Wallet balance, payment history, and merchant activity are often visible by default.", size=1600),
            ])
            + text_box(7, "P2", emu(4.4), emu(2.2), emu(2.9), emu(2.2), [
                paragraph_xml("Crypto tools are not merchant-friendly", size=1800, color="7EFFCC", bold=True),
                paragraph_xml("Many tools are wallet-first, not invoice-first. Real businesses need links, checkout, receipts, and tracking.", size=1600),
            ])
            + text_box(8, "P3", emu(7.65), emu(2.2), emu(2.9), emu(2.2), [
                paragraph_xml("Privacy and usability rarely come together", size=1800, color="7EFFCC", bold=True),
                paragraph_xml("Merchants should not have to choose between privacy and a practical payment flow.", size=1600),
            ])
            + text_box(9, "Bottom", emu(0.95), emu(5.5), emu(10.8), emu(0.9), [
                paragraph_xml("AnonPay turns private payments into a product merchants can actually use.", size=1900, color="F3F3F3", bold=True)
            ])
        )
    )

    slides.append(
        slide_xml(
            text_box(2, "Title", emu(0.9), emu(0.8), emu(11.0), emu(0.8), [
                paragraph_xml("Architecture", size=2800, color="F3F3F3", bold=True),
            ])
            + rect(3, "Merchant", emu(0.8), emu(2.2), emu(2.2), emu(1.3), "1B1B1B", "7EFFCC", True)
            + rect(4, "Frontend", emu(3.45), emu(2.2), emu(2.5), emu(1.3), "1B1B1B", "70B7FF", True)
            + rect(5, "Backend", emu(6.45), emu(2.2), emu(2.5), emu(1.3), "1B1B1B", "F5C76D", True)
            + rect(6, "Midnight", emu(9.45), emu(2.2), emu(2.3), emu(1.3), "1B1B1B", "FF8FB1", True)
            + line(7, "Arrow1", emu(3.0), emu(2.85), emu(3.42), emu(2.85))
            + line(8, "Arrow2", emu(5.95), emu(2.85), emu(6.42), emu(2.85))
            + line(9, "Arrow3", emu(8.95), emu(2.85), emu(9.42), emu(2.85))
            + text_box(10, "MerchantText", emu(1.0), emu(2.5), emu(1.8), emu(0.7), [
                paragraph_xml("Merchant / Payer", size=1700, color="F3F3F3", bold=True),
            ])
            + text_box(11, "FrontText", emu(3.7), emu(2.5), emu(2.0), emu(0.7), [
                paragraph_xml("React frontend", size=1700, color="F3F3F3", bold=True),
            ])
            + text_box(12, "BackText", emu(6.7), emu(2.5), emu(2.0), emu(0.7), [
                paragraph_xml("Node backend", size=1700, color="F3F3F3", bold=True),
            ])
            + text_box(13, "MidText", emu(9.7), emu(2.5), emu(1.8), emu(0.7), [
                paragraph_xml("Midnight", size=1700, color="F3F3F3", bold=True),
            ])
            + text_box(14, "Explain", emu(1.0), emu(4.2), emu(10.4), emu(2.2), [
                paragraph_xml("Simple flow", size=2200, color="F3F3F3", bold=True),
                paragraph_xml("1. Merchant creates an invoice or checkout session in the frontend.", size=1700),
                paragraph_xml("2. Backend stores invoice data in Supabase and coordinates session state.", size=1700),
                paragraph_xml("3. Payer settles through the Midnight payment flow.", size=1700),
                paragraph_xml("4. Backend reconciles status, receipts, and webhooks for the merchant dashboard.", size=1700),
            ])
        )
    )

    slides.append(
        slide_xml(
            text_box(2, "Title", emu(0.9), emu(0.8), emu(11.0), emu(0.8), [
                paragraph_xml("Revenue model", size=2800, color="F3F3F3", bold=True),
            ])
            + rect(3, "R1", emu(1.0), emu(2.0), emu(3.0), emu(2.4), "1A1A1A", "7EFFCC", True)
            + rect(4, "R2", emu(4.3), emu(2.0), emu(3.0), emu(2.4), "1A1A1A", "70B7FF", True)
            + rect(5, "R3", emu(7.6), emu(2.0), emu(3.0), emu(2.4), "1A1A1A", "F5C76D", True)
            + text_box(6, "Rev1", emu(1.25), emu(2.3), emu(2.5), emu(1.8), [
                paragraph_xml("Merchant SaaS", size=1800, color="7EFFCC", bold=True),
                paragraph_xml("Monthly plans for dashboard access, analytics, profiles, and reporting.", size=1600),
            ])
            + text_box(7, "Rev2", emu(4.55), emu(2.3), emu(2.5), emu(1.8), [
                paragraph_xml("Checkout fee", size=1800, color="70B7FF", bold=True),
                paragraph_xml("A small fee per successful payment or per hosted checkout session.", size=1600),
            ])
            + text_box(8, "Rev3", emu(7.85), emu(2.3), emu(2.5), emu(1.8), [
                paragraph_xml("SDK / enterprise", size=1800, color="F5C76D", bold=True),
                paragraph_xml("Developer API plans, custom onboarding, and enterprise integrations.", size=1600),
            ])
            + text_box(9, "Bottom", emu(1.0), emu(5.35), emu(10.0), emu(0.9), [
                paragraph_xml("Start simple: SaaS + payment fee. Expand later into API and enterprise deals.", size=1800, color="D9D9D9")
            ])
        )
    )

    slides.append(
        slide_xml(
            text_box(2, "Title", emu(0.9), emu(0.8), emu(11.0), emu(0.8), [
                paragraph_xml("Demo video", size=2800, color="F3F3F3", bold=True),
            ])
            + rect(3, "DemoCard", emu(0.95), emu(1.9), emu(10.3), emu(3.3), "1A1A1A", "333333", True)
            + text_box(4, "DemoText", emu(1.25), emu(2.3), emu(9.7), emu(2.5), [
                paragraph_xml("Google Drive link", size=2100, color="7EFFCC", bold=True),
                paragraph_xml("Paste your demo video link here before sharing the deck.", size=1800),
                paragraph_xml("Example: https://drive.google.com/...", size=1800, color="BDBDBD"),
                paragraph_xml("Recommended demo flow: create invoice -> share QR/link -> payment page -> dashboard / burner / profile.", size=1600),
            ])
            + text_box(5, "Close", emu(1.0), emu(5.65), emu(10.0), emu(0.8), [
                paragraph_xml("Keep the demo short and clean. Show only the core flow that works reliably.", size=1750, color="F3F3F3", bold=True)
            ])
        )
    )

    return slides


def content_types(slide_count: int) -> str:
    slide_overrides = "\n".join(
        f'  <Override PartName="/ppt/slides/slide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>'
        for i in range(1, slide_count + 1)
    )
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  <Override PartName="/ppt/presProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presProps+xml"/>
  <Override PartName="/ppt/viewProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.viewProps+xml"/>
  <Override PartName="/ppt/tableStyles.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.tableStyles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
{slide_overrides}
</Types>
"""


def root_rels() -> str:
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="{REL_NS}">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
"""


def presentation_xml(slide_count: int) -> str:
    sld_ids = "\n".join(
        f'    <p:sldId id="{256 + i}" r:id="rId{i + 1}"/>' for i in range(1, slide_count + 1)
    )
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="{A_NS}" xmlns:r="{R_NS}" xmlns:p="{P_NS}">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
{sld_ids}
  </p:sldIdLst>
  <p:sldSz cx="{SLIDE_W}" cy="{SLIDE_H}" type="screen16x9"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>
"""


def presentation_rels(slide_count: int) -> str:
    slide_rels = "\n".join(
        f'  <Relationship Id="rId{i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide{i}.xml"/>'
        for i in range(1, slide_count + 1)
    )
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="{REL_NS}">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
{slide_rels}
</Relationships>
"""


def slide_master_xml() -> str:
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="{A_NS}" xmlns:r="{R_NS}" xmlns:p="{P_NS}">
  <p:cSld name="Simple Master">
    <p:bg>
      <p:bgPr>
        <a:solidFill><a:srgbClr val="121212"/></a:solidFill>
      </p:bgPr>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst>
    <p:sldLayoutId id="2147483649" r:id="rId1"/>
  </p:sldLayoutIdLst>
  <p:txStyles>
    <p:titleStyle/>
    <p:bodyStyle/>
    <p:otherStyle/>
  </p:txStyles>
</p:sldMaster>
"""


def slide_master_rels() -> str:
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="{REL_NS}">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>
"""


def slide_layout_xml() -> str:
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="{A_NS}" xmlns:r="{R_NS}" xmlns:p="{P_NS}" type="blank" preserve="1">
  <p:cSld name="Blank">
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>
"""


def slide_layout_rels() -> str:
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="{REL_NS}">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>
"""


def theme_xml() -> str:
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="{A_NS}" name="AnonPay Theme">
  <a:themeElements>
    <a:clrScheme name="AnonPay Colors">
      <a:dk1><a:srgbClr val="121212"/></a:dk1>
      <a:lt1><a:srgbClr val="F5F5F5"/></a:lt1>
      <a:dk2><a:srgbClr val="242424"/></a:dk2>
      <a:lt2><a:srgbClr val="D9D9D9"/></a:lt2>
      <a:accent1><a:srgbClr val="7EFFCC"/></a:accent1>
      <a:accent2><a:srgbClr val="70B7FF"/></a:accent2>
      <a:accent3><a:srgbClr val="F5C76D"/></a:accent3>
      <a:accent4><a:srgbClr val="FF8FB1"/></a:accent4>
      <a:accent5><a:srgbClr val="A0A0A0"/></a:accent5>
      <a:accent6><a:srgbClr val="5A5A5A"/></a:accent6>
      <a:hlink><a:srgbClr val="70B7FF"/></a:hlink>
      <a:folHlink><a:srgbClr val="FF8FB1"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="AnonPay Fonts">
      <a:majorFont>
        <a:latin typeface="Aptos"/>
        <a:ea typeface=""/>
        <a:cs typeface=""/>
      </a:majorFont>
      <a:minorFont>
        <a:latin typeface="Aptos"/>
        <a:ea typeface=""/>
        <a:cs typeface=""/>
      </a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="AnonPay Format">
      <a:fillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
      </a:fillStyleLst>
      <a:lnStyleLst>
        <a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
      </a:lnStyleLst>
      <a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>
      <a:bgFillStyleLst>
        <a:solidFill><a:schemeClr val="bg1"/></a:solidFill>
      </a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
  <a:objectDefaults/>
  <a:extraClrSchemeLst/>
</a:theme>
"""


def pres_props() -> str:
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentationPr xmlns:a="{A_NS}" xmlns:r="{R_NS}" xmlns:p="{P_NS}"/>
"""


def view_props() -> str:
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:viewPr xmlns:a="{A_NS}" xmlns:r="{R_NS}" xmlns:p="{P_NS}">
  <p:normalViewPr>
    <p:restoredLeft sz="15620"/>
    <p:restoredTop sz="94660"/>
  </p:normalViewPr>
  <p:slideViewPr/>
  <p:outlineViewPr/>
  <p:notesTextViewPr/>
  <p:gridSpacing cx="780288" cy="780288"/>
</p:viewPr>
"""


def table_styles() -> str:
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:tblStyleLst xmlns:a="{A_NS}" def=""/>
"""


def core_props() -> str:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="{CP_NS}" xmlns:dc="{DC_NS}" xmlns:dcterms="{DCTERMS_NS}" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="{XSI_NS}">
  <dc:title>AnonPay 5 slide pitch</dc:title>
  <dc:creator>OpenAI Codex</dc:creator>
  <cp:lastModifiedBy>OpenAI Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified>
</cp:coreProperties>
"""


def app_props(slide_count: int) -> str:
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="{EP_NS}" xmlns:vt="{VT_NS}">
  <Application>Microsoft Office PowerPoint</Application>
  <PresentationFormat>On-screen Show (16:9)</PresentationFormat>
  <Slides>{slide_count}</Slides>
  <Notes>0</Notes>
  <HiddenSlides>0</HiddenSlides>
  <MMClips>0</MMClips>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs>
    <vt:vector size="2" baseType="variant">
      <vt:variant><vt:lpstr>Theme</vt:lpstr></vt:variant>
      <vt:variant><vt:i4>1</vt:i4></vt:variant>
    </vt:vector>
  </HeadingPairs>
  <TitlesOfParts>
    <vt:vector size="1" baseType="lpstr">
      <vt:lpstr>AnonPay Theme</vt:lpstr>
    </vt:vector>
  </TitlesOfParts>
  <Company></Company>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0000</AppVersion>
</Properties>
"""


def build() -> None:
    slides = make_slides()
    with zipfile.ZipFile(OUT, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", content_types(len(slides)))
        zf.writestr("_rels/.rels", root_rels())
        zf.writestr("ppt/presentation.xml", presentation_xml(len(slides)))
        zf.writestr("ppt/_rels/presentation.xml.rels", presentation_rels(len(slides)))
        zf.writestr("ppt/slideMasters/slideMaster1.xml", slide_master_xml())
        zf.writestr("ppt/slideMasters/_rels/slideMaster1.xml.rels", slide_master_rels())
        zf.writestr("ppt/slideLayouts/slideLayout1.xml", slide_layout_xml())
        zf.writestr("ppt/slideLayouts/_rels/slideLayout1.xml.rels", slide_layout_rels())
        zf.writestr("ppt/theme/theme1.xml", theme_xml())
        zf.writestr("ppt/presProps.xml", pres_props())
        zf.writestr("ppt/viewProps.xml", view_props())
        zf.writestr("ppt/tableStyles.xml", table_styles())
        zf.writestr("docProps/core.xml", core_props())
        zf.writestr("docProps/app.xml", app_props(len(slides)))
        for index, slide in enumerate(slides, start=1):
            zf.writestr(f"ppt/slides/slide{index}.xml", slide)

    print(f"Created {OUT}")


if __name__ == "__main__":
    build()
