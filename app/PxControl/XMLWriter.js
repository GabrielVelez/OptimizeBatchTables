'use strict'
let XMLWrite = require('xml-writer')
var fs = require('fs');
const moment = require('moment');

class XMLWriter {

    async print(xmlData) {
        try {
            if (!fs.existsSync('./xmls')){
                fs.mkdirSync('./xmls');
            }
            let xml = new XMLWrite;
            xml.startDocument('1.0', 'UTF-8').startElement('SOAP:Envelope')
            xml.writeAttribute('xmlns:xsd', "http://www.w3.org/2001/XMLSchema")
            xml.writeAttribute('xmlns:xsi', "http://www.w3.org/2001/XMLSchema-instance")
            xml.writeAttribute('xmlns:SOAP', "http://schemas.xmlsoap.org/soap/envelope/")

            xml.startElement('SOAP:Body')

            xml.startElement('ProcessProductionPerformance')
            xml.writeAttribute('xmlns', 'http://www.wbf.org/xml/B2MML-V0401')
            xml.writeAttribute('releaseID', '')
            xml.writeAttribute('xmlns:xsd', 'http://www.w3.org/2001/XMLSchema')
            xml.writeAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')

            xml.startElement('ApplicationArea')
            xml.startElement('Sender')
            xml.startElement('ReferenceID')
            xml.text('Systelec')
            xml.endElement()
            xml.endElement()
            xml.startElement('CreationDateTime')
            xml.text(`${xmlData.CreationDateTime}`)//Fecha actual o fecha del post
            xml.endElement()
            xml.endElement()
            xml.startElement('DataArea')
            xml.startElement('Process')
            xml.startElement('ActionCriteria')
            xml.startElement('ActionExpression')
            xml.startElement('TransExpressionType')
            xml.writeAttribute('actionCode', 'Add')
            xml.text('1')
            xml.endElement()
            xml.endElement()
            xml.endElement()
            xml.endElement()
            xml.startElement('ProductionPerformance')
            xml.startElement('Location')
            xml.startElement('EquipmentID')
            xml.text('3003')
            xml.endElement()
            xml.startElement('EquipmentElementLevel')
            xml.text('Site')
            xml.endElement()
            xml.endElement()
            xml.startElement('Location')
            xml.startElement('EquipmentID')//Mixer
            xml.text(xmlData.Mixer)
            xml.endElement()
            xml.startElement('EquipmentElementLevel')
            xml.text('WorkCenter')
            xml.endElement()
            xml.endElement()
            xml.startElement('ProductionScheduleID')//Numero de OT
            xml.text(xmlData.OrderNum)
            xml.endElement()
            xml.startElement('ProductionResponse')
            xml.startElement('ProductionRequestID')
            xml.endElement()
            xml.startElement('SegmentResponse')
            xml.startElement('ProductSegmentID')
            xml.endElement()
            xml.startElement('MaterialActual')
            xml.startElement('MaterialDefinitionID')
            xml.text(xmlData.ProductCode)//Codigo de producto lo saco de vBatch
            xml.endElement()
            xml.startElement('MaterialLotID')
            xml.text(xmlData.Lot)//Numero de lote me lo calculo
            xml.endElement()
            xml.startElement('MaterialSubLotID')
            xml.endElement()
            xml.startElement('Description')
            xml.text(xmlData.Description)// Viene de la orden de produccion      prDescToProd(en db)
            xml.endElement()
            xml.startElement('MaterialUse')
            xml.endElement()
            xml.startElement('Location')
            xml.startElement('EquipmentID')
            xml.text(xmlData.Mixer)//Mixer               prodLine(en db)
            xml.endElement()
            xml.startElement('EquipmentElementLevel')
            xml.text('WorkCenter')
            xml.endElement()
            xml.startElement('Location')
            xml.startElement('EquipmentID')
            xml.text('CUC')
            xml.endElement()
            xml.startElement('EquipmentElementLevel')
            xml.writeAttribute('OtherValue', 'StorageBin')
            xml.endElement()
            xml.endElement()
            xml.endElement()
            xml.startElement('Quantity')
            xml.startElement('QuantityString')
            xml.text(xmlData.Quantity)//Cantidad sacada de vBatch
            xml.endElement()
            xml.startElement('DataType')
            xml.text('decimal')
            xml.endElement()
            xml.startElement('UnitOfMeasure')
            xml.text('KG')
            xml.endElement()
            xml.endElement()
            xml.endElement()
            xml.endElement()
            xml.endElement()
            xml.endElement()
            xml.endElement()

            xml.endElement()
            xml.endElement()
            xml.endElement()


            xml.endDocument()
            fs.writeFile(`./xmls/MAK075_${xmlData.OrderNum}_${moment().format('YYYYMMDD_HHmmss_SSS')}.xml`, xml.output.toString(), (err) => {
                if (err) console.log(err)
            })
        }
        catch(error){
            console.log(moment().format('YYYY-MM-DD HH:mm:ss'), ` (Error en xmlWriter) Error: ${error}`)
        }
    }
}

module.exports = XMLWriter
