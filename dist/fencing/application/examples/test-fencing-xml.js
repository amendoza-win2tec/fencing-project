"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FencingXmlTester = void 0;
const dotenv_1 = require("dotenv");
const fs = require("fs");
const path = require("path");
(0, dotenv_1.config)();
class FencingXmlTester {
    createExampleXml() {
        return `<?xml version="1.0" encoding="UTF-8"?>
<CompetitionIndividuelle Version="3.3" Championnat="TEST" ID="000" Annee="2008/2009" Arme="E" Sexe="M" Domaine="I" Federation="ZZZ" Categorie="S" Date="06.02.2009" TitreCourt="ZZ-293" TitreLong="Evaluation competition">
  <Tireurs>
    <Tireur ID="1" Nom="ABBAZ" Prenom="Jose Luis" DateNaissance="22.06.1978" Sexe="M" Lateralite="I" Nation="ESP" dossard="2001" IdOrigine="2380" Classement="36"/>
    <Tireur ID="2" Nom="ACHARD" Prenom="Norman" DateNaissance="13.08.1983" Sexe="M" Lateralite="I" Nation="GER" dossard="2002" IdOrigine="3440"/>
    <Tireur ID="3" Nom="ADAM" Prenom="Martin" DateNaissance="15.06.1988" Sexe="M" Lateralite="I" Nation="AZE" dossard="2003" IdOrigine="21542"/>
  </Tireurs>
  <Arbitres>
    <Arbitre ID="3" Nom="TRIBOUILLARD" Prenom="Aurélien" DateNaissance="10.09.1963" Sexe="M" Nation="FRA" Categorie="B" IdOrigine="10930"/>
  </Arbitres>
  <Phases>
    <TourDePoules PhaseID="TourPoules1" ID="1" NbDePoules="1" PhaseSuivanteDesQualifies="PhaseTableaux1" NbExemptes="0" NbQualifiesParPoule="0" NbQualifiesParIndice="3">
      <Tireur REF="1" RangInitial="5" RangFinal="3" Statut="Q" IdOrigine="2380"/>
      <Tireur REF="2" RangInitial="11" RangFinal="1" Statut="Q" IdOrigine="3440"/>
      <Tireur REF="3" RangInitial="40" RangFinal="2" Statut="Q" IdOrigine="21542"/>
      <Poule ID="1" Piste="BLUE" Date="06.02.2009" Heure="16:00">
        <Tireur REF="1" NoDansLaPoule="1" NbVictoires="1" NbMatches="2" TD="10" TR="10" RangPoule="2"/>
        <Tireur REF="2" NoDansLaPoule="2" NbVictoires="2" NbMatches="2" TD="15" TR="5" RangPoule="1"/>
        <Tireur REF="3" NoDansLaPoule="3" NbVictoires="0" NbMatches="2" TD="5" TR="15" RangPoule="3"/>
        <Arbitre REF="3" Role="P"/>
        <Match ID="1">
          <Tireur REF="1" Score="5" Statut="V" Cote="D"/>
          <Tireur REF="3" Score="3" Statut="D" Cote="G"/>
        </Match>
        <Match ID="2">
          <Tireur REF="2" Score="5" Statut="V" Cote="D"/>
          <Tireur REF="1" Score="2" Statut="D" Cote="G"/>
        </Match>
        <Match ID="3">
          <Tireur REF="2" Score="5" Statut="V" Cote="D"/>
          <Tireur REF="3" Score="2" Statut="D" Cote="G"/>
        </Match>
      </Poule>
    </TourDePoules>
  </Phases>
</CompetitionIndividuelle>`;
    }
    async testFencingXmlEndpoint() {
        try {
            console.log('🚀 Testing Fencing XML Processing Endpoint...');
            const xmlContent = this.createExampleXml();
            console.log('✅ Example XML created');
            const response = await fetch('http://localhost:3000/api/fencing/process-xml', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    xmlContent: xmlContent,
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            console.log('✅ Fencing XML processed successfully');
            console.log('📊 Result:', JSON.stringify(result, null, 2));
            const outputDir = path.join(__dirname);
            const resultFile = path.join(outputDir, 'fencing-xml-result.json');
            fs.writeFileSync(resultFile, JSON.stringify(result, null, 2));
            console.log(`📄 Result saved to: ${resultFile}`);
        }
        catch (error) {
            console.error('❌ Error testing fencing XML endpoint:', error);
            throw error;
        }
    }
    async testFencingFileEndpoint() {
        try {
            console.log('🚀 Testing Fencing File Processing Endpoint...');
            const xmlContent = this.createExampleXml();
            console.log('✅ Example XML file content created');
            const response = await fetch('http://localhost:3000/api/fencing/process-file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    xmlFile: xmlContent,
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            console.log('✅ Fencing XML file processed successfully');
            console.log('📊 Result:', JSON.stringify(result, null, 2));
            const outputDir = path.join(__dirname);
            const resultFile = path.join(outputDir, 'fencing-file-result.json');
            fs.writeFileSync(resultFile, JSON.stringify(result, null, 2));
            console.log(`📄 Result saved to: ${resultFile}`);
        }
        catch (error) {
            console.error('❌ Error testing fencing file endpoint:', error);
            throw error;
        }
    }
    async runTests() {
        try {
            console.log('🎯 Starting Fencing XML Processing Tests...');
            await this.testFencingXmlEndpoint();
            console.log('\n' + '='.repeat(50) + '\n');
            await this.testFencingFileEndpoint();
            console.log('\n✅ All fencing XML processing tests completed successfully!');
        }
        catch (error) {
            console.error('❌ Error running fencing XML tests:', error);
            throw error;
        }
    }
}
exports.FencingXmlTester = FencingXmlTester;
async function main() {
    const tester = new FencingXmlTester();
    await tester.runTests();
}
if (require.main === module) {
    main().catch(console.error);
}
//# sourceMappingURL=test-fencing-xml.js.map