var wms_layers = [];

var lyr_GNDVI_19Jandata_0 = new ol.layer.Image({
        opacity: 1,
        
    title: 'GNDVI_19Jan.data<br />\
    <img src="styles/legend/GNDVI_19Jandata_0_0.png" /> 0.0843<br />\
    <img src="styles/legend/GNDVI_19Jandata_0_1.png" /> 0.4814<br />\
    <img src="styles/legend/GNDVI_19Jandata_0_2.png" /> 0.5218<br />\
    <img src="styles/legend/GNDVI_19Jandata_0_3.png" /> 0.5731<br />\
    <img src="styles/legend/GNDVI_19Jandata_0_4.png" /> 0.9017<br />' ,
        
        
        source: new ol.source.ImageStatic({
            url: "./layers/GNDVI_19Jandata_0.png",
            attributions: ' ',
            projection: 'EPSG:3857',
            alwaysInRange: true,
            imageExtent: [-8681495.383640, -199109.939598, -8681395.099602, -198985.619864]
        })
    });
var lyr_MSAVI_19Jandata_1 = new ol.layer.Image({
        opacity: 1,
        
    title: 'MSAVI_19Jan.data<br />\
    <img src="styles/legend/MSAVI_19Jandata_1_0.png" /> 0.0002<br />\
    <img src="styles/legend/MSAVI_19Jandata_1_1.png" /> 0.0019<br />\
    <img src="styles/legend/MSAVI_19Jandata_1_2.png" /> 0.0023<br />\
    <img src="styles/legend/MSAVI_19Jandata_1_3.png" /> 0.0031<br />\
    <img src="styles/legend/MSAVI_19Jandata_1_4.png" /> 0.0108<br />' ,
        
        
        source: new ol.source.ImageStatic({
            url: "./layers/MSAVI_19Jandata_1.png",
            attributions: ' ',
            projection: 'EPSG:3857',
            alwaysInRange: true,
            imageExtent: [-8681495.383640, -199109.939598, -8681395.099602, -198985.619864]
        })
    });
var lyr_NDRE_19Jandata_2 = new ol.layer.Image({
        opacity: 1,
        
    title: 'NDRE_19Jan.data<br />\
    <img src="styles/legend/NDRE_19Jandata_2_0.png" /> -0.0248<br />\
    <img src="styles/legend/NDRE_19Jandata_2_1.png" /> 0.1344<br />\
    <img src="styles/legend/NDRE_19Jandata_2_2.png" /> 0.1567<br />\
    <img src="styles/legend/NDRE_19Jandata_2_3.png" /> 0.1922<br />\
    <img src="styles/legend/NDRE_19Jandata_2_4.png" /> 0.5860<br />' ,
        
        
        source: new ol.source.ImageStatic({
            url: "./layers/NDRE_19Jandata_2.png",
            attributions: ' ',
            projection: 'EPSG:3857',
            alwaysInRange: true,
            imageExtent: [-8681495.383640, -199109.939598, -8681395.099602, -198985.619864]
        })
    });
var lyr_NDVI_19Jan2024data_3 = new ol.layer.Image({
        opacity: 1,
        
    title: 'NDVI_19Jan2024.data<br />\
    <img src="styles/legend/NDVI_19Jan2024data_3_0.png" /> 0.0756<br />\
    <img src="styles/legend/NDVI_19Jan2024data_3_1.png" /> 0.2958<br />\
    <img src="styles/legend/NDVI_19Jan2024data_3_2.png" /> 0.5160<br />\
    <img src="styles/legend/NDVI_19Jan2024data_3_3.png" /> 0.7362<br />\
    <img src="styles/legend/NDVI_19Jan2024data_3_4.png" /> 0.9563<br />' ,
        
        
        source: new ol.source.ImageStatic({
            url: "./layers/NDVI_19Jan2024data_3.png",
            attributions: ' ',
            projection: 'EPSG:3857',
            alwaysInRange: true,
            imageExtent: [-8681495.383640, -199109.939598, -8681395.099602, -198985.619864]
        })
    });
var lyr_GCI_19Jan2024data_4 = new ol.layer.Image({
        opacity: 1,
        
    title: 'GCI_19Jan2024.data<br />\
    <img src="styles/legend/GCI_19Jan2024data_4_0.png" /> 0.1848<br />\
    <img src="styles/legend/GCI_19Jan2024data_4_1.png" /> 1.8698<br />\
    <img src="styles/legend/GCI_19Jan2024data_4_2.png" /> 2.2042<br />\
    <img src="styles/legend/GCI_19Jan2024data_4_3.png" /> 2.7200<br />\
    <img src="styles/legend/GCI_19Jan2024data_4_4.png" /> 18.3968<br />' ,
        
        
        source: new ol.source.ImageStatic({
            url: "./layers/GCI_19Jan2024data_4.png",
            attributions: ' ',
            projection: 'EPSG:3857',
            alwaysInRange: true,
            imageExtent: [-8681495.383640, -199109.939598, -8681395.099602, -198985.619864]
        })
    });
var lyr_Orthomosaic_19Jan2024Boundaryrgb_5 = new ol.layer.Image({
        opacity: 1,
        
    title: 'Orthomosaic_19Jan2024 - Boundary.rgb<br />' ,
        
        
        source: new ol.source.ImageStatic({
            url: "./layers/Orthomosaic_19Jan2024Boundaryrgb_5.png",
            attributions: ' ',
            projection: 'EPSG:3857',
            alwaysInRange: true,
            imageExtent: [-8681495.383640, -199109.939598, -8681395.099602, -198985.619864]
        })
    });
var format_Estadisticazonal_6 = new ol.format.GeoJSON();
var features_Estadisticazonal_6 = format_Estadisticazonal_6.readFeatures(json_Estadisticazonal_6, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Estadisticazonal_6 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Estadisticazonal_6.addFeatures(features_Estadisticazonal_6);
var lyr_Estadisticazonal_6 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_Estadisticazonal_6, 
                style: style_Estadisticazonal_6,
                popuplayertitle: 'Estadistica zonal',
                interactive: true,
    title: 'Estadistica zonal<br />\
    <img src="styles/legend/Estadisticazonal_6_0.png" /> <br />\
    <img src="styles/legend/Estadisticazonal_6_1.png" /> 1<br />\
    <img src="styles/legend/Estadisticazonal_6_2.png" /> 2<br />\
    <img src="styles/legend/Estadisticazonal_6_3.png" /> 3<br />\
    <img src="styles/legend/Estadisticazonal_6_4.png" /> 4<br />' });

lyr_GNDVI_19Jandata_0.setVisible(true);lyr_MSAVI_19Jandata_1.setVisible(true);lyr_NDRE_19Jandata_2.setVisible(true);lyr_NDVI_19Jan2024data_3.setVisible(true);lyr_GCI_19Jan2024data_4.setVisible(true);lyr_Orthomosaic_19Jan2024Boundaryrgb_5.setVisible(true);lyr_Estadisticazonal_6.setVisible(true);
var layersList = [lyr_GNDVI_19Jandata_0,lyr_MSAVI_19Jandata_1,lyr_NDRE_19Jandata_2,lyr_NDVI_19Jan2024data_3,lyr_GCI_19Jan2024data_4,lyr_Orthomosaic_19Jan2024Boundaryrgb_5,lyr_Estadisticazonal_6];
lyr_Estadisticazonal_6.set('fieldAliases', {'fid': 'fid', 'id': 'id', 'left': 'left', 'top': 'top', 'right': 'right', 'bottom': 'bottom', 'row_index': 'row_index', 'col_index': 'col_index', 'Area': 'Area', 'NDVI_mean': 'NDVI_mean', 'NDVI_stdev': 'NDVI_stdev', 'NDRE_mean': 'NDRE_mean', 'NDRE_stdev': 'NDRE_stdev', 'MSAVI_mean': 'MSAVI_mean', 'MSAVI_stdev': 'MSAVI_stdev', 'GCI_mean': 'GCI_mean', 'GCI_stdev': 'GCI_stdev', 'group': 'group', 'plant': 'plant', });
lyr_Estadisticazonal_6.set('fieldImages', {'fid': 'TextEdit', 'id': 'TextEdit', 'left': 'TextEdit', 'top': 'TextEdit', 'right': 'TextEdit', 'bottom': 'TextEdit', 'row_index': 'TextEdit', 'col_index': 'TextEdit', 'Area': 'TextEdit', 'NDVI_mean': 'TextEdit', 'NDVI_stdev': 'TextEdit', 'NDRE_mean': 'TextEdit', 'NDRE_stdev': 'TextEdit', 'MSAVI_mean': 'TextEdit', 'MSAVI_stdev': 'TextEdit', 'GCI_mean': 'TextEdit', 'GCI_stdev': 'TextEdit', 'group': 'Range', 'plant': 'TextEdit', });
lyr_Estadisticazonal_6.set('fieldLabels', {'fid': 'hidden field', 'id': 'hidden field', 'left': 'hidden field', 'top': 'hidden field', 'right': 'hidden field', 'bottom': 'hidden field', 'row_index': 'hidden field', 'col_index': 'hidden field', 'Area': 'hidden field', 'NDVI_mean': 'header label - visible with data', 'NDVI_stdev': 'hidden field', 'NDRE_mean': 'header label - visible with data', 'NDRE_stdev': 'hidden field', 'MSAVI_mean': 'header label - visible with data', 'MSAVI_stdev': 'hidden field', 'GCI_mean': 'header label - visible with data', 'GCI_stdev': 'hidden field', 'group': 'inline label - visible with data', 'plant': 'inline label - visible with data', });
lyr_Estadisticazonal_6.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});