var wms_layers = [];

var lyr_OP_PWNI_0 = new ol.layer.Image({
        opacity: 1,
        
    title: 'OP_PWNI<br />\
    <img src="styles/legend/OP_PWNI_0_0.png" /> 0,3968<br />\
    <img src="styles/legend/OP_PWNI_0_1.png" /> 0,9661<br />\
    <img src="styles/legend/OP_PWNI_0_2.png" /> 1,5353<br />\
    <img src="styles/legend/OP_PWNI_0_3.png" /> 2,1046<br />\
    <img src="styles/legend/OP_PWNI_0_4.png" /> 2,6738<br />' ,
        
        
        source: new ol.source.ImageStatic({
            url: "./layers/OP_PWNI_0.png",
            attributions: ' ',
            projection: 'EPSG:3857',
            alwaysInRange: true,
            imageExtent: [-9520484.812449, -2915.231583, -9505608.525556, 12146.844069]
        })
    });
var format_PWNI_1 = new ol.format.GeoJSON();
var features_PWNI_1 = format_PWNI_1.readFeatures(json_PWNI_1, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_PWNI_1 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_PWNI_1.addFeatures(features_PWNI_1);
var lyr_PWNI_1 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_PWNI_1, 
                style: style_PWNI_1,
                popuplayertitle: 'PWNI',
                interactive: true,
    title: 'PWNI<br />\
    <img src="styles/legend/PWNI_1_0.png" /> 0,768 - 0,961<br />\
    <img src="styles/legend/PWNI_1_1.png" /> 0,961 - 0,991<br />\
    <img src="styles/legend/PWNI_1_2.png" /> 0,991 - 1,016<br />\
    <img src="styles/legend/PWNI_1_3.png" /> 1,016 - 1,053<br />\
    <img src="styles/legend/PWNI_1_4.png" /> 1,053 - 1,198<br />' });
var lyr_OP_PSI_2 = new ol.layer.Image({
        opacity: 1,
        
    title: 'OP_PSI<br />\
    <img src="styles/legend/OP_PSI_2_0.png" /> 0,4616<br />\
    <img src="styles/legend/OP_PSI_2_1.png" /> 0,5335<br />\
    <img src="styles/legend/OP_PSI_2_2.png" /> 0,6054<br />\
    <img src="styles/legend/OP_PSI_2_3.png" /> 0,6773<br />\
    <img src="styles/legend/OP_PSI_2_4.png" /> 0,7492<br />' ,
        
        
        source: new ol.source.ImageStatic({
            url: "./layers/OP_PSI_2.png",
            attributions: ' ',
            projection: 'EPSG:3857',
            alwaysInRange: true,
            imageExtent: [-9520484.812449, -2915.231583, -9505608.525556, 12146.844069]
        })
    });
var format_PSI_3 = new ol.format.GeoJSON();
var features_PSI_3 = format_PSI_3.readFeatures(json_PSI_3, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_PSI_3 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_PSI_3.addFeatures(features_PSI_3);
var lyr_PSI_3 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_PSI_3, 
                style: style_PSI_3,
                popuplayertitle: 'PSI',
                interactive: true,
    title: 'PSI<br />\
    <img src="styles/legend/PSI_3_0.png" /> 0,6323 - 0,6739<br />\
    <img src="styles/legend/PSI_3_1.png" /> 0,6739 - 0,6769<br />\
    <img src="styles/legend/PSI_3_2.png" /> 0,6769 - 0,6798<br />\
    <img src="styles/legend/PSI_3_3.png" /> 0,6798 - 0,6852<br />\
    <img src="styles/legend/PSI_3_4.png" /> 0,6852 - 0,708<br />' });
var lyr_OP_FPI_4 = new ol.layer.Image({
        opacity: 1,
        
    title: 'OP_FPI<br />\
    <img src="styles/legend/OP_FPI_4_0.png" /> 0,2771<br />\
    <img src="styles/legend/OP_FPI_4_1.png" /> 1,1252<br />\
    <img src="styles/legend/OP_FPI_4_2.png" /> 1,9733<br />\
    <img src="styles/legend/OP_FPI_4_3.png" /> 2,8215<br />\
    <img src="styles/legend/OP_FPI_4_4.png" /> 3,6696<br />' ,
        
        
        source: new ol.source.ImageStatic({
            url: "./layers/OP_FPI_4.png",
            attributions: ' ',
            projection: 'EPSG:3857',
            alwaysInRange: true,
            imageExtent: [-9520484.812449, -2915.231583, -9505608.525556, 12146.844069]
        })
    });
var format_FPI_5 = new ol.format.GeoJSON();
var features_FPI_5 = format_FPI_5.readFeatures(json_FPI_5, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_FPI_5 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_FPI_5.addFeatures(features_FPI_5);
var lyr_FPI_5 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_FPI_5, 
                style: style_FPI_5,
                popuplayertitle: 'FPI',
                interactive: true,
    title: 'FPI<br />\
    <img src="styles/legend/FPI_5_0.png" /> 0,734 - 1,005<br />\
    <img src="styles/legend/FPI_5_1.png" /> 1,005 - 1,051<br />\
    <img src="styles/legend/FPI_5_2.png" /> 1,051 - 1,093<br />\
    <img src="styles/legend/FPI_5_3.png" /> 1,093 - 1,145<br />\
    <img src="styles/legend/FPI_5_4.png" /> 1,145 - 1,353<br />' });

lyr_OP_PWNI_0.setVisible(true);lyr_PWNI_1.setVisible(true);lyr_OP_PSI_2.setVisible(true);lyr_PSI_3.setVisible(true);lyr_OP_FPI_4.setVisible(true);lyr_FPI_5.setVisible(true);
var layersList = [lyr_OP_PWNI_0,lyr_PWNI_1,lyr_OP_PSI_2,lyr_PSI_3,lyr_OP_FPI_4,lyr_FPI_5];
lyr_PWNI_1.set('fieldAliases', {'fid': 'fid', 'x1': 'x1', 'y1': 'y1', 'x2': 'x2', 'y2': 'y2', 'w': 'w', 'h': 'h', 'center_x': 'center_x', 'center_y': 'center_y', 'radius': 'radius', 'PWNImean': 'PWNImean', 'CODIGO ': 'CODIGO ', });
lyr_PSI_3.set('fieldAliases', {'fid': 'fid', 'x1': 'x1', 'y1': 'y1', 'x2': 'x2', 'y2': 'y2', 'w': 'w', 'h': 'h', 'center_x': 'center_x', 'center_y': 'center_y', 'radius': 'radius', 'PCImean': 'PCImean', 'CODIGO': 'CODIGO', });
lyr_FPI_5.set('fieldAliases', {'fid': 'fid', 'x1': 'x1', 'y1': 'y1', 'x2': 'x2', 'y2': 'y2', 'w': 'w', 'h': 'h', 'center_x': 'center_x', 'center_y': 'center_y', 'radius': 'radius', 'FPImean': 'FPImean', 'CODIGO': 'CODIGO', });
lyr_PWNI_1.set('fieldImages', {'fid': 'TextEdit', 'x1': 'TextEdit', 'y1': 'TextEdit', 'x2': 'TextEdit', 'y2': 'TextEdit', 'w': 'TextEdit', 'h': 'TextEdit', 'center_x': 'TextEdit', 'center_y': 'TextEdit', 'radius': 'TextEdit', 'PWNImean': 'TextEdit', 'CODIGO ': 'TextEdit', });
lyr_PSI_3.set('fieldImages', {'fid': 'TextEdit', 'x1': 'TextEdit', 'y1': 'TextEdit', 'x2': 'TextEdit', 'y2': 'TextEdit', 'w': 'TextEdit', 'h': 'TextEdit', 'center_x': 'TextEdit', 'center_y': 'TextEdit', 'radius': 'TextEdit', 'PCImean': 'TextEdit', 'CODIGO': 'TextEdit', });
lyr_FPI_5.set('fieldImages', {'fid': 'TextEdit', 'x1': 'TextEdit', 'y1': 'TextEdit', 'x2': 'TextEdit', 'y2': 'TextEdit', 'w': 'TextEdit', 'h': 'TextEdit', 'center_x': 'TextEdit', 'center_y': 'TextEdit', 'radius': 'TextEdit', 'FPImean': 'TextEdit', 'CODIGO': 'TextEdit', });
lyr_PWNI_1.set('fieldLabels', {'fid': 'hidden field', 'x1': 'hidden field', 'y1': 'hidden field', 'x2': 'hidden field', 'y2': 'hidden field', 'w': 'hidden field', 'h': 'hidden field', 'center_x': 'hidden field', 'center_y': 'hidden field', 'radius': 'hidden field', 'PWNImean': 'header label - always visible', 'CODIGO ': 'header label - always visible', });
lyr_PSI_3.set('fieldLabels', {'fid': 'hidden field', 'x1': 'hidden field', 'y1': 'hidden field', 'x2': 'hidden field', 'y2': 'hidden field', 'w': 'hidden field', 'h': 'hidden field', 'center_x': 'hidden field', 'center_y': 'hidden field', 'radius': 'hidden field', 'PCImean': 'header label - always visible', 'CODIGO': 'header label - always visible', });
lyr_FPI_5.set('fieldLabels', {'fid': 'hidden field', 'x1': 'hidden field', 'y1': 'hidden field', 'x2': 'hidden field', 'y2': 'hidden field', 'w': 'hidden field', 'h': 'hidden field', 'center_x': 'hidden field', 'center_y': 'hidden field', 'radius': 'hidden field', 'FPImean': 'header label - always visible', 'CODIGO': 'header label - always visible', });
lyr_FPI_5.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});