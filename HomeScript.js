
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


    let GeoTIFFloader = function (img, src) {
      const self = this;
      const canvas = document.createElement('canvas');
      GeoTIFF.fromUrl(src)
        .then(tiff => tiff.getImage()
          .then(image => {
            const width = image.getWidth();
            const height = image.getHeight();
            const bbox = image.getBoundingBox();
            // world files (TFW) not supported!
            
            canvas.width = width;
            canvas.height = height;
            self.extent = bbox;
            image.readRGB().then(raster => {

              // render raw image data (rgb) to canvas
              let ctx = canvas.getContext("2d");
              let imageData = ctx.createImageData(width, height);
              let o = 0;
              for (let i = 0; i < raster.length; i += 3) {
                imageData.data[o] = raster[i];
                imageData.data[o + 1] = raster[i + 1];
                imageData.data[o + 2] = raster[i + 2];
                imageData.data[o + 3] = 255;
                o += 4;
              }
              ctx.putImageData(imageData, 0, 0);

              img.getImage().src = canvas.toDataURL();
            })
          }))
        .catch(error => console.error(error));
    };

    let SHPloader = function (extent, resolution, projection) {
      const self = this;
      shapefile.open(self.getUrl())
        .then(source => source.read()
          .then(function load(result) {
            if (result.done) return;
            self.addFeatures(
              self.getFormat().readFeatures(result.value)
            );
            return source.read().then(load);
          }))
        .catch(error => self.removeLoadedExtent(extent))
    };

    // client side styling
    let strokeCache = {
      '2': new ol.style.Stroke({ // állam
        color: [255, 35, 35],
        width: 4
      }),
      '5': new ol.style.Stroke({ // régió
        color: [255, 35, 35],
        width: 2
      }),
      '6': new ol.style.Stroke({ // megye
        color: [255, 145, 1],
        width: 1
      }),
      '7': new ol.style.Stroke({ // járás
        color: [183, 64, 0],
        width: 1
      }),
      '8': new ol.style.Stroke({ // település
        color: [225, 198, 76],
        width: 1
      }),
      '9': new ol.style.Stroke({ // kerület
        color: [35, 35, 35],
        width: 1
      })
    };
    
    let defaultStyle = new ol.style.Style({
      fill: new ol.style.Fill({
        color: [255, 255, 255, 0.2]
      }),
      stroke: new ol.style.Stroke({
        color: [255, 35, 35],
        width: 1.5
      }),
      text: new ol.style.Text({
        text: '',
        fill: new ol.style.Fill({
          color: [33, 33, 33]
        })
      })
    });


    // its very important for performance to cache styles
    let vectorStyle = (feature, resolution) => {
      let level = feature.get('level');
      let text = feature.get('name');
      if (level == 9 && resolution > 110) return null;
      if (level == 8 && resolution > 110) return null;
      if (level == 7 && resolution > 250) return null;
      if (level == 6 && resolution > 350) return null;
      if (level == 5 && resolution > 450) return null;
      //if (level == 2 && resolution > 700) return null;
      defaultStyle.text_.text_ = text;
      defaultStyle.stroke_ = strokeCache[level];
      return [defaultStyle];
    };

    




























    
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


    function addVector(url,name){
        var vectorLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: url,
                format: new ol.format.GeoJSON()
            }),
            style: styles,
            name:name,
            title:name
        });
        map.addLayer(vectorLayer);
    }

    function addLayer(file,data){
        const fileName = file.name;
        const typeGeometry = data.features[0].geometry.type;
        const layerList = document.getElementsByClassName('layerList');
        let divLayerGrp = document.createElement('div');
        divLayerGrp.className = 'layerGroup';
        let div = document.createElement('div');
        div.className = 'layer';
        div.innerHTML = '<input type="checkbox" name="Layer" class="activeLayer" checked><h4>'+ fileName +'</h4><a href="#" class="zoomLayer">Zoom</a>'
        divLayerGrp.appendChild(div);
        div = document.createElement('div');
        div.className = 'geom '+ typeGeometry;
        divLayerGrp.appendChild(div);
        layerList[0].appendChild(divLayerGrp);
    }
    function addLayerND(file){
      const fileName = file.name;
      const layerList = document.getElementsByClassName('layerList');
      let divLayerGrp = document.createElement('div');
      divLayerGrp.className = 'layerGroup';
      let div = document.createElement('div');
      div.className = 'layer';
      div.innerHTML = '<input type="checkbox" name="Layer" class="activeLayer" name="'+ fileName +'" checked><h4>'+ fileName +'</h4><a href="#" class="zoomLayer">Zoom</a>'
      divLayerGrp.appendChild(div);
      layerList[0].appendChild(divLayerGrp);
  }
    $('.inputfile').change(function(){
        let fileInput = document.getElementsByClassName('inputfile');
        const selectedFiles = [...fileInput[0].files];
        var tmppath = URL.createObjectURL(selectedFiles[0]);
        const fileExt = selectedFiles[0].name.split('.').pop();


        if( fileExt === 'geojson' || fileExt === 'json'){
          fetch(tmppath)
            .then((res) => {
              addVector(res.url,selectedFiles[0].name);
            return(res.json())
            })
            .then((data) => addLayer(selectedFiles[0],data))
        }
        else if(fileExt === 'tiff' || fileExt === 'tif'){
          var geotiffFile = new ol.layer.Image({
            title: selectedFiles[0].name,
            source: new ol.source.ImageStatic({
              imageLoadFunction: GeoTIFFloader,
              imageExtent: ol.proj.get('EPSG:3857').getExtent(),
              url: tmppath
            }),
            visible: true
          })
          map.addLayer(geotiffFile);
          addLayerND(selectedFiles[0]);        
        }
        else if(fileExt === 'shp'){
          fetch(tmppath)
          .then((res)=>{
            console.log(res);
            var shpFile = new ol.layer.Vector({
              title: selectedFiles[0].name,
              source: new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                loader: SHPloader,
                url: res.url
              }),
              style: vectorStyle,
              visible: true
            })
            map.addLayer(shpFile);
            addLayerND(selectedFiles[0]);  



          })
                 
        }
        else if(fileExt === 'kml'){



          var kmlFile = new ol.layer.Vector({
            title: selectedFiles[0].name,
            source: new ol.source.Vector({
              format: new ol.format.KML(),
              url: tmppath
            }),
            style: vectorStyle,
            visible: true
          })
          map.addLayer(kmlFile);
          addLayerND(selectedFiles[0]);

          
        }
        else if(fileExt === 'wkt'){



          var wktFile = new ol.layer.Vector({
            title: selectedFiles[0].name,
            source: new ol.source.Vector({
              format: new ol.format.WKT(),
              url: 'data/boundaries.wkt'
            }),
            style: vectorStyle,
            visible: true
          })
          map.addLayer(wktFile);
          addLayerND(selectedFiles[0]);

          
        }    
        else{
          alert("Your browser doesn't support to read files");
        }
        
    });

    
    // Zoom to Layer
    $(document).ready(function(){

      $(document).on('click','.zoomLayer',function(e){
        // console.log(e.target.previousElementSibling.innerHTML)
        var namelayer = e.target.previousElementSibling.innerHTML
        map.getLayers().forEach((layer)=>{
          // console.log(layer.get('title'));
          if(namelayer === layer.get('title')){
            // console.log(ol.extent.getCenter(layer.getSource().getExtent()))
            var layerCenter = ol.extent.getCenter(layer.getSource().getExtent())
            map.getView().animate({center: layerCenter, duration:1000,zoom:5});
          }
        })
      })
    })
















}