<script>
import { mapGetters } from "vuex";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import layerCollection from "../../../../src_3_0_0/core/layers/js/layerCollection";
import mapCollection from "../../../../src_3_0_0/core/maps/js/mapCollection";
import { getArea, getLength } from "ol/sphere.js";

/**
 * ReportPrinter
 * @description Report Printer
 * @module addons/ReportPrinter
 */
export default {
  name: "ReportPrinter",
  data() {
    return {
      projectTitle:
        "Report zur Analyse und Maßnahmenplanung der Maßnahme Entsiegelung (Log-Nr YY)",
      projectDescription: "test",
      projectData: [
        { name: "Projekt A", value: 100 },
        { name: "Projekt B", value: 200 },
        { name: "Projekt C", value: 300 },
      ],
      layerData: [],
      pdf: {
        fontSize: {
          xs: 10,
          s: 12,
          m: 16,
          l: 20,
          xl: 24,
        },
        max: { height: 300, width: 210 },
        margin: { top: 8, right: 8, bottom: 9, left: 8 },
      },
      map: {
        center: [0, 0],
      },
      lineHeight: 10,
    };
  },
  computed: {
    ...mapGetters([
      "allLayerConfigs",
      "Maps/projectionCode",
      "layerConfig",
      "portalConfig",
    ]),
  },
  methods: {
    async takeScreenshot() {
      const mapElement = document.getElementById("map");
      if (!mapElement) {
        throw new Error("Kartencontainer nicht gefunden");
      }

      const canvas = mapElement.querySelector("canvas");
      if (!canvas) {
        throw new Error("Canvas-Element in der Karte nicht gefunden");
      }

      try {
        return canvas.toDataURL("image/png");
      } catch (e) {
        console.error("Fehler beim direkten Zugriff auf das Canvas:", e);
        throw new Error("Konnte keinen Screenshot erstellen");
      }
    },
    addTable(doc, data, startY) {
      const cellPadding = 5;
      const lineHeight = 10;
      const columnWidths = [40, 60, 60];

      doc.setFont("bold");
      doc.text("Name", 10, startY);
      doc.text("Typ", 50, startY);
      doc.text("Wert", 110, startY);

      doc.setFont("normal");
      let y = startY + lineHeight;

      data.forEach((row) => {
        doc.text(row.name.toString(), 10, y);
        doc.text(row.typ.toString(), 50, y);
        doc.text(row.value.toString(), 110, y);
        y += lineHeight;

        if (y > 280) {
          // 280 ist eine Beispiel-Y-Position, die du anpassen kannst
          doc.addPage();
          y = 10; // Zurücksetzen der Y-Position auf der neuen Seite
        }
      });

      doc.rect(10, startY - 5, 170, y - startY + 5);
    },

    addSocioEconomicAnalysis(doc, startY) {
      const criteria = [
        "Niedrige Kosten",
        "Stadtklima",
        "Erholung",
        "Lärmschutz",
        "Habitatvielfalt",
        "Luftreinhaltung",
      ];

      const values = [85, 75, 65, 55, 45, 35];
      const averageValues = [60, 70, 80, 50, 40, 30];

      console.log("[ReportPrinter] this.pdf.fontSize.s::", this.pdf.fontSize.s);
      doc.setFontSize(this.pdf.fontSize.s);
      doc.text("Sozioökonomische Analyse", 10, startY);

      let y = startY + 10;
      criteria.forEach((criterion, index) => {
        if (y > 280) {
          // Überprüfen, ob eine neue Seite benötigt wird
          doc.addPage();
          y = 10; // Zurücksetzen der Y-Position auf der neuen Seite
        }
        doc.text(
          `${criterion}: Entsiegelung - ${values[index]}, Durchschnitt - ${averageValues[index]}`,
          10,
          y,
        );
        y += 10;
      });

      return y;
    },

    addHeader(doc) {
      let y = 1;
      let x = 0;
      doc.setFillColor("#29A992");
      // rect: x, y, w, h, style
      doc.rect(x, y, this.pdf.max.width, 8, "F");
      doc.setFontSize(this.pdf.fontSize.m);
      y += this.pdf.margin.bottom + 8;
      doc.text("AMAREX Webtool", 100, y);
      doc.setFontSize(this.pdf.fontSize.s);
      y += this.pdf.margin.bottom;
      doc.text("Report Nr. xxx, Bearbeiter: Blau Grüner", 100, y);
      y += this.pdf.margin.bottom;

      return y; // Neue Y-Position nach dem Header
    },
    async getData() {
      const mapView = await mapCollection.getMapView("2D");
      console.log("[ReportPrinter] mapView::", mapView);
      this.map.center = mapView.getCenter();
      console.log("[ReportPrinter] this.map.center::", this.map.center);
    },

    async generatePDF() {
      const doc = new jsPDF();
      // start at x = 10, y = 10
      let x = 10;
      let y = 10;

      const addNewPageIfNeeded = (yPosition, doc) => {
        if (yPosition > this.pdf.max.width - this.pdf.margin.bottom) {
          doc.addPage();
          yPosition = this.addHeader(doc);
        }
        return yPosition;
      };

      y = this.addHeader(doc);

      y += this.pdf.margin.top;
      doc.setFontSize(this.pdf.fontSize.m).text(this.projectTitle, x, y);
      y += this.pdf.margin.bottom;

      doc
        .setFontSize(this.pdf.fontSize.m)
        .text("Steckbrief Untersuchungsgebiet", x, y);
      y += this.pdf.margin.bottom;

      y += this.pdf.margin.top;
      doc
        .setFontSize(this.pdf.fontSize.m)
        .text(`X-Koordinate: ${this.map.center[0].toFixed(2)}`, x, y);
      y += this.pdf.margin.bottom;
      doc
        .setFontSize(this.pdf.fontSize.m)
        .text(`Y-Koordinate: ${this.map.center[1].toFixed(2)}`, x, y);
      y += this.pdf.margin.bottom;

      try {
        doc.save("report.pdf");
      } catch (error) {
        console.error("Fehler beim Erstellen des PDFs:", error);
      }
    },
  },
};
</script>

<template lang="html">
  <div
    id="report-printer"
    class="ReportPrinter-root mb-3"
    ref="test"
  >
    <div class="mb-3">
      <label
        for="projectTitle"
        class="form-label"
        >Reporttitel:</label
      >
      <textarea
        v-model="projectTitle"
        id="projectTitle"
        class="form-control"
        rows="2"
      ></textarea>
    </div>
    <div class="mb-3">
      <label
        for="projectDescription"
        class="form-label"
        >Projektbeschreibung:</label
      >
      <textarea
        v-model="projectDescription"
        id="projectDescription"
        class="form-control"
        rows="3"
      ></textarea>
    </div>
    <button
      class="btn btn-primary"
      @click="generatePDF"
    >
      Download Report
    </button>

    <button
      class="btn btn-primary"
      @click="getData"
    >
      get Data for Report
    </button>
  </div>
</template>

<style lang="scss">
.ReportPrinter-root {
  width: 100%;
  height: 100px;
}
</style>

