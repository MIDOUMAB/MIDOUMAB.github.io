window.onload = init
    
function init(){
     //Map
     const map = new ol.Map({
        
        view: new ol.View({
            center: [-70954.81624963802, 3755118.649904738],
            zoom: 6,
        }),
    
        target:'map'
    })

    // Layers
    const ImageSat = new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' 
        }),
        visible: false,
        title:"ImageSat",
        
    })
    map.addLayer(ImageSat)
    const OSMStandard = new ol.layer.Tile({
        source: new ol.source.OSM({
        }),
        visible: true,
        title:"OSMStandard",
    })
    map.addLayer(OSMStandard)
    

    // //Layers Group
    // const layersGroup = new ol.layer.Group({
    //     name:'BaseMaps',
    //     layers: [OSMStandard, ImageSat]
    // }) 
    // map.addLayer(layersGroup)

    // Switcher Control
    var switcher = new ol.control.LayerSwitcher({
        activationMode: 'click',
        startActive: false,
        groupSelectStyle: 'children'
    })
    map.addControl(switcher)

     //Fullscreen control 
     var fullScreen = new ol.control.FullScreen()
     map.addControl(fullScreen)

     //MousePosition
    var mousePosition = new ol.control.MousePosition({
        className:'mousePosition',
        projection:'EPSG:4326',
        coordinateFormat: function(coordinate){return ol.coordinate.format(coordinate, '{x}   {y}', 4);}
    })
    map.addControl(mousePosition)





    // Input File





    // function readImage(file) {
    //     const reader = new FileReader();
    //     reader.addEventListener('load', (event) => {
    //         console.log(event.target)
    //         var jsonObj = JSON.parse(event.target.result);
    //         alert(jsonObj.name);
    //     });
    //     reader.readAsDataURL(file);
    //   }

    
    // Add file to html

    const styles = [
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: 'blue',
            width: 3,
          }),
          fill: new ol.style.Fill({
            color: 'rgba(0, 0, 255, 0.1)',
          }),
        }),
        new ol.style.Style({
          image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({
              color: 'orange',
            }),
          }),
        }),
      ];
    function addVector(url){
        var vectorLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: url,
                format: new ol.format.GeoJSON()
            }),
            // source: new ol.source.Vector({
            //     features: (new ol.format.GeoJSON({
            //       featureProjection: 'EPSG:3857'
            //     })).readFeatures(geoJSON)
            //   }),
            // style: new ol.style.Style({
            //     image: new ol.style.Circle({
            //         radius: 5,
            //         fill: new ol.style.Fill({
            //             color: '#e9b200'
            //         })
            //     })
            // })
            style: styles
        });
        map.addLayer(vectorLayer);
    }
    function addLayer(file,data){
        fileName = file.name;
        typeGeometry = data.features[0].geometry.type;
        const layerList = document.getElementsByClassName('layerList');
        let divLayerGrp = document.createElement('div');
        divLayerGrp.className = 'layerGroup';
        let div = document.createElement('div');
        div.className = 'layer';
        div.innerHTML = '<input type="checkbox" name="Layer" class="activeLayer" checked><h4>'+ fileName +'</h4><a href="#">Zoom</a>'
        divLayerGrp.appendChild(div);
        div = document.createElement('div');
        div.className = 'geom '+ typeGeometry;
        divLayerGrp.appendChild(div);
        layerList[0].appendChild(divLayerGrp);

    }
    
    $('.inputfile').change(function(){
        let fileInput = document.getElementsByClassName('inputfile');
        const selectedFiles = [...fileInput[0].files];
        
        fetch(selectedFiles[0].name)
            .then((res) => {
                addVector(res.url)
            return(res.json())
            })
            .then((data) => addLayer(selectedFiles[0],data))
            

        // if (fileInput[0].files && fileInput[0].files[0]){
        //     console.log(fileInput[0].files[0]);
        // }
        // else{
        //     alert("Your browser doesn't support to read files");
        // }
    });
    
    

    
      




















}