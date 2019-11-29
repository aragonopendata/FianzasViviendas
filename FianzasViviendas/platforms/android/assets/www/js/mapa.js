document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() { 
    var slider = document.getElementById('slider');
    $("#select-year").change(function() {
      defaultAño=$("#select-year").val();
      slider.noUiSlider.set([defaultAño-5,defaultAño])
      if($.mobile.activePage.attr('id')=="pagetwo")
      {
          loadChart(hideSpinner);
          popup.hide();
      }
      if($.mobile.activePage.attr('id')=="pageone"){
        reloadLayer(lastCoordinate,false)
      }

    });

  
    var lastCoordinate=null;
    $("#flipLocal").on("change", function(){
      popup.hide();
      var valor=$("#flipLocal").val();
      if(valor=='on')
      {
        localValue=2;
      }
      else
      {
        localValue=1;
      }
      popup.hide();  
      if($.mobile.activePage.attr('id')=="pageone")
      {
        reloadLayer(lastCoordinate,false,function(){
          $("#graph").empty()
          //loadChart(hideSpinner);
        });
      }
      else if($.mobile.activePage.attr('id')=="pagetwo"){
        loadChart(function(){
          hideSpinner()
          reloadLayer(lastCoordinate,false);
        });
      } 
    });
    $("#flipPdi").on("change", function(){    // al cambiar calles/Pdi
      $(".tooltip").remove();     
      popup.hide();
      var valor=$("#flipPdi").val();
      var nombres=[]
      $("#calles1").val("")
      $("#calles2").val("")
      $("#localidad1").val("")
      $("#localidad2").val("")
      $("#textoPrincipal1").text("Seleccionar elemento...")
      $("#textoSecundario1").text("")
      $("#textoPrincipal2").text("Seleccionar elemento...")
      $("#textoSecundario2").text("")
      $("#graph").empty()
      if(valor=='on')
      {
        pdiValue=1;
        $(".lblCalle").text("PDI")
      }
      else
      {
        pdiValue=0;
        $(".lblCalle").text("Calle")
      }
      reloadLayer(lastCoordinate,false);
    });      

    var altura=$("#footer").position().top
    $("#map").css("height",altura+"px")

     
    var divControl=$(".ol-overlaycontainer-stopevent");
    var locateMeDiv=$("#panel");
    divControl.append(locateMeDiv);
    // Now safe to use device APIs
    if(typeof(window.localStorage.getItem('has_run'))!= 'string') { /// Primera ejecución, ejecuto la instalación de la BBDD
      window.plugins.spinnerDialog.show(null, "Instalando, espere", true);  
      window.localStorage.setItem('has_run', 'true',true);
      window.localStorage.setItem('revision', '1',true);
      window.localStorage.setItem('tutorial', 'false',true);
      importJsonToDb();
    }
    else{ /// Ejecuciones posteriores, compruebo si existen nuevos datos

      if(window.localStorage.getItem('tutorial') != 'true'){  ///La primera vez tras instalar abro el tutorial

        window.localStorage.setItem('tutorial', 'true',true);
        location.href="#tutorial"
      }
      
      jQuery.getJSON(urlServerVersion, function(datos){
        var updates=datos.updates
        var base=datos.base
        var revision=datos.revision
        var myRevision=window.localStorage.getItem('revision') 

        function onConfirm(buttonIndex) {
          if(buttonIndex == 2)
          {
            window.plugins.spinnerDialog.show(null, "Actualizando, espere ", true);
            checkVersion(base,false,function(){
              checkVersion(updates,true,function(){
                window.plugins.spinnerDialog.hide()
                window.localStorage.setItem('revision', revision,true);
              })
            })
          }
        }
        if(myRevision<revision && revision!=undefined){
          navigator.notification.confirm(
              'Hay actualizaciones de los datos, ¿Deseas actualizar ahora?', // message
               onConfirm,            // callback to invoke with index of button pressed
              'Actualizaciones',           // title
              ['No','Si, Actualizar']     // buttonLabels
          );
        }
      })
    }
    function checkVersion(list,isUpdate,callback)
    {
      var i=0
      while(i<list.length)
      {
        if(!isUpdate){
          checkBase(list[i].name,list[i].version,function(){
            i++
          })  
        }
        else
        {
          checkUpdates(list[i].name,list[i].version,function(){
            i++
          })  
        }
      }
      callback()
    }
    function checkBase(name,lastBase,_callback)
    {
      var query="SELECT base from dataVersion where name='"+name+"'"
      db.transaction(function(tx){   
        tx.executeSql(query,[],function(tx,results){

          var myVersion=results.rows.item(0).base
          if(myVersion<lastBase)
          {
            db.transaction(function(tx){
              tx.executeSql("update dataVersion set base='"+lastBase+"',update='0' where name='"+name+"'");
            })
            restoreTable(name,lastBase)  
          }
        })
      })
      _callback()
    }
    function checkUpdates(name,lastVersion,_callback){
      var query="SELECT base,version from dataVersion where name='"+name+"'"
      db.transaction(function(tx){   
        tx.executeSql(query,[],function(tx,results){
          var myVersion=results.rows.item(0).version
          var myBase=results.rows.item(0).base
          if(myVersion<lastVersion)
          {
            db.transaction(function(tx){
              tx.executeSql("update dataVersion set version='"+lastVersion+"' where name='"+name+"'");
            }) 
            updateTable(name,myBase,myVersion,lastVersion,function(){
              window.plugins.spinnerDialog.hide();
            })   
          }
        })
      })
      _callback()
    }
    var layer = new ol.layer.Tile({
        source: new ol.source.OSM()
    });


  var center = ol.proj.transform([-0.876566, 41.6563497], 'EPSG:4326', 'EPSG:3857');

  view = new ol.View({
  center: center,
  zoom: 14,
  projection: 'EPSG:3857'
  });

  var interactions = ol.interaction.defaults({altShiftDragRotate:false, pinchRotate:false}); 
  map = new ol.Map({
    target: 'map',
    layers: [layer],
    view: view,
    interactions: interactions
  });


  // Añadir foto idearagon

  /*var layerSwitcher = new ol.control.LayerSwitcher({ 
    tipLabel: 'Leyenda' 
  });

  map.addControl(layerSwitcher);




  var fondo =new ol.layer.Image({
        source: new ol.source.ImageWMS({
            params: {'LAYERS': 'Vial,Portal','VERSION':'1.1.1',
                'TRANSPARENT':true,
                'FORMAT':"image/png"},
            url: 'http://www.cartociudad.es/wms/CARTOCIUDAD/CARTOCIUDAD',
            //projection: "EPSG:25830"
          })
        });
  map.addLayer(fondo)*/

  //layerSwitcher.showPanel();


  var element=$(".ol3-geocoder-container")
  var position=element.position().top+35;
  $('#panel').css('top',position);
    // create an Overlay using the div with id location.
    var marker = new ol.Overlay({
        element: document.getElementById('location'),
        //positioning: 'bottom-left',
        stopEvent: false
    });
    // add it to the map
    map.addOverlay(marker);
    
    navigator.geolocation.getCurrentPosition( successLocation, errorLocation, {enableHighAccuracy: true, timeout: 10000, maximumAge: 3000}); 
    // create a Geolocation object setup to track the position of the device
    var geolocation = new ol.Geolocation({
        tracking: true,
        projection: 'EPSG:3857'
    });
   

    // bind the projection to the view so that positions are reported in the
    // projection of the view

    //geolocation.bindTo('projection', view);
    //marker.bindTo('position', geolocation);
    // bind the marker's position to the geolocation object, the marker will
    // move automatically when the GeoLocation API provides position updates

    var popup = new ol.Overlay.Popup();
    map.addOverlay(popup);

    
    var locationSearch=true;
    
    var tracking=true;
    
    /*var longpress = false;
      var startTime, endTime;
      $("#map").on('touchstart click', function () {
          startTime = new Date().getTime();
      });

      $("#map").on('touchend click', function () {
        endTime = new Date().getTime();
        longpress = (endTime - startTime < 200) ? false : true;
      });
    map.on("clickhold", function(e) {
      popup.hide();
      
      alert("long")
      locationSearch=false;
      reloadLayer(e.coordinate,false);
    })*/    
    map.on("click",function(e){  
      popup.hide()
      var feature = map.forEachFeatureAtPixel(e.pixel, function(feature, layer) {
        return feature;
      });
       var coordinates=e.coordinate;
      if(feature)
      {
        var features = feature.get('features');
        if(features.length>4)
        {
          view.setCenter(coordinates);
          var zoom=view.getZoom()+1;
          view.setZoom(zoom);
        }
        else
        {
          if(features.length==1){
            var name=features[0].get('name')
            var max_renta=Math.floor(features[0].get('max_renta'))
            var min_renta=Math.floor(features[0].get('min_renta'))
            var media_renta=Math.floor(features[0].get('precio'))
            var localidad=features[0].get('localidad')
            var c_mun_via=features[0].get('c_mun_via')
            var tabla="infoCalles"
            var col="c_mun_via"
            if(pdiValue==1)
            {
              tabla="infoPois"
              col="id_poi"
            }
            db.transaction(function(tx){ 
                tx.executeSql("select max(anyo)as max_anyo,min(anyo) as min_anyo from "+tabla+" where "+col+"='"+c_mun_via+"'",[],function(tx,results){
                  var max_anyo=results.rows.item(0).max_anyo
                  var min_anyo=results.rows.item(0).min_anyo
                  var rangoAños
                  if(max_anyo!=min_anyo)
                  {
                    rangoAños=" Años "+min_anyo+"-"+max_anyo
                  }
                  else
                  {
                    rangoAños=" Año "+max_anyo
                  }
                  
                  popup.show(name, '<div><h3><a>'+name+', '+localidad+'</a></h3><b>Año '+defaultAño+':</b><ul style="list-style: none; margin-left: -20px !important; margin: 0 auto;"> <li><b>Precio Máximo: '+max_renta+'€</b></li><li><b>Precio Medio: '+media_renta+'€</b></li><li><b>Precio Mínimo: '+min_renta+'€</b></li></ul><h4 style="margin-bottom: 0px;">Ver Histórico:</h4><b style="margin: 0 auto;">'+rangoAños+'</b><p style="text-align: center;"><i onclick="calcula('+"'"+name+"',"+"'"+localidad+"'"+')" class="fa fa-line-chart fa-4x icon-steelblue" aria-hidden="true"></i></p></div>');
                  popup.setPosition(coordinates);
              })
            })
            //popup.show(features[0].get('name'), '<div><h3>'+features[0].get('name')+'</h3><p><h4>Precio Medio: '+Math.floor(features[0].get('precio'))+'€</p><p style="text-align:center"><i onclick="calcula('+"'"+features[0].get('name')+"',"+"'"+features[0].get('localidad')+"'"+')" class="fa fa-line-chart fa-4x icon-steelblue" aria-hidden="true"></i></p></div>');
          }
          else
          {
            var listado="";
            for(var i=0;i<features.length;i++)
            {
              listado+='<p><a onclick="calcula('+"'"+features[i].get('name')+"',"+"'"+features[i].get('localidad')+"'"+')">'+features[i].get('name')+": "+Math.floor(features[i].get('precio'))+'€ </a></p>';
            }
            popup.show(features[0].get('name'), '<div>'+listado+'</div>');
            popup.setPosition(coordinates);
          }
        }
        
      }  
    });
    // when the GeoLocation API provides a position update, center the view
    // on the new position
    var p;
    var lastLayer;
    var lastPosition=null;
    geolocation.on('change:position', function() {
      p = geolocation.getPosition();
      marker.setPosition(p)
      if(tracking==true)
      {
        view.setCenter(p);
      }
      if(typeof(p)!='undefined')
      {   
        if(lastPosition==null){  
          reloadLayer(p,true);
          lastPosition=p;
        }
        else
        {
          //var coordP=ol.proj.transform(p, 'EPSG:3857', 'EPSG:4326');
          //var coordLast=ol.proj.transform(lastPosition, 'EPSG:3857', 'EPSG:4326');
          if(Math.abs(Math.abs(p[0])-Math.abs(lastPosition[0]))>1000 || Math.abs(Math.abs(p[1])-Math.abs(lastPosition[1]))>1000)
          {
            reloadLayer(p,true);
          }
        }
      } 
      //console.log(p[0] + ' : ' + p[1]);   
    });
    
    var vectorSource = new ol.source.Vector({});
    function reloadLayer(p,geo,callback)
    {
      lastCoordinate=p;
      //map.removeLayer(lastLayer);
      vectorSource.clear();
     // var coord=ol.proj.transform(p, 'EPSG:3857', 'EPSG:4326');
      getCalles(vectorSource,p[0],p[1],function() {
        /*var vector_layer = new ol.layer.Vector({
            name: "vectorLayer",
            source: vectorSource,
            style: styleFunction
          });*/
        
         //lastLayer = clusterLayer;
         if(geo){
          lastPosition=p; 
         }
         //console.log(lastLayer.getSource().getFeatures());
         //map.addLayer(vector_layer);
         //map.addLayer(clusterLayer);
         if(callback!=undefined)
          callback();
      });
    }


    map.on('moveend', function (e) {
      var center=map.getView().getCenter();
      var coordP=ol.proj.transform(center, 'EPSG:3857', 'EPSG:4326');
      if(lastCoordinate!=undefined){
        var coordLast=ol.proj.transform(lastCoordinate, 'EPSG:3857', 'EPSG:4326');
        if((view.getZoom()>13 && tracking==false))
        {
          if(Math.abs(Math.abs(coordP[0])-Math.abs(coordLast[0]))>0.01 || Math.abs(Math.abs(coordP[1])-Math.abs(coordLast[1]))>0.01)
          {
            locationSearch=false;
            reloadLayer(center,false);
          }
        }
      }
      if(p!=undefined)
      {
        if(center[0]!=p[0] && center[1]!=p[1])  /// El boton locateMe tambien lanza moveend, cuando el centro es mi pos, no desactivo el tracking
        {
          tracking=false;   /// Cuando muevo el mapa no quiero que siga el tracking. 
        }
      }
    });

    $('#locateMe').click(function(){

        //console.log('click');
        $("#location").show();
        view.setCenter(p);
        view.setZoom(16);
        tracking=true;
        if(!locationSearch)
        {
          locationSearch=true;
          reloadLayer(p,true);
        }
        
    });

    var styleCache = {};

    function getCalles(vectorSource,myLong,myLat,_callback){
      // do some asynchronous work
      // and when the asynchronous stuff is complete
      var limit= pdiValue==1 ? 1000 : 500
      var latUpLimit=myLat+limit;
      var latDownLimit=myLat-limit;
      var longUpLimit=myLong+limit;
      var longDownLimit=myLong-limit;
      var myCalc=myLat-myLong
      var query= pdiValue==0 ? "SELECT lat,long,etiqueta,media_renta,c_mun_via,localidad,min_renta,max_renta,lat-long as calc from infoCalles where anyo="+defaultAño+" and c_y>"+latDownLimit+" and c_y<"+latUpLimit+" and c_x>"+longDownLimit+" and c_x<"+longUpLimit+" and eslocal='"+localValue+"' group by c_mun_via,anyo ORDER BY abs("+myCalc+"- calc ) "
     : "SELECT lat,long,etiqueta,precio_medio as media_renta,precio_min as min_renta,precio_max as max_renta,id_poi as c_mun_via,localidad from infoPois where anyo="+defaultAño+" and eslocal='"+localValue+"' and lat>"+latDownLimit+" and lat<"+latUpLimit+" and long>"+longDownLimit+" and long<"+longUpLimit+" group by id_poi"
      db.transaction(function(tx){
        tx.executeSql(query,[],function(tx,results){
          var i=0;
          while(i<results.rows.length)
          {
            //console.log("YO "+myLong+" "+myLat+" BUSCA: "+results.rows.item(i).c_x+" "+results.rows.item(i).c_y)
            var latitud=results.rows.item(i).lat;
            var longitud=results.rows.item(i).long;
            var name=results.rows.item(i).etiqueta;
            var total_rentas=results.rows.item(i).media_renta;
            var c_mun_via= results.rows.item(i).c_mun_via;
            var localidad=results.rows.item(i).localidad;
            var min_renta=results.rows.item(i).min_renta;
            var max_renta=results.rows.item(i).max_renta;
            addSource(longitud,latitud,name,total_rentas,c_mun_via,localidad,max_renta,min_renta,function(){
              i++;
            });
          }
        });
      });
      _callback();    
    }
    /*function getPois(vectorSource,myLong,myLat,_callback){
      // do some asynchronous work
      // and when the asynchronous stuff is complete
      var latUpLimit=myLat+1000;
      var latDownLimit=myLat-1000;
      var longUpLimit=myLong+1000;
      var longDownLimit=myLong-1000;
      db.transaction(function(tx){
        tx.executeSql("SELECT * from infoPois where anyo="+defaultAño+" and eslocal='"+localValue+"' and lat>"+latDownLimit+" and lat<"+latUpLimit+" and long>"+longDownLimit+" and long<"+longUpLimit+" group by id_poi,anyo",[],function(tx,results){
          var i=0;
          while(i<results.rows.length)
          {
            var latitud=results.rows.item(i).lat;
            var longitud=results.rows.item(i).long;
            var name=results.rows.item(i).etiqueta;
            var total_rentas=results.rows.item(i).precio_medio;
            var c_mun_via= results.rows.item(i).id_poi;
            var localidad=results.rows.item(i).localidad;
            addPoiSource(longitud,latitud,name,total_rentas,c_mun_via,localidad,function(){
              i++;
            });
          }
        });
      });
      _callback();    
    }*/
    var vectorSource = new ol.source.Vector({});
    var clusterSource = new ol.source.Cluster({
          source: vectorSource,
          distance: 50
        });
    var clusterLayer = new ol.layer.Vector({
          source: clusterSource,
          style: function (feature, resolution) {
            var size = feature.get('features').length;

            var style = styleCache[size];
            var radius = size + 10;
            if (radius > 20) {
                radius = 20;
            }
            
            if (!style  && size>1) {
                style = [new ol.style.Style({
                image: new ol.style.Circle({
                    radius: radius,
                    stroke: new ol.style.Stroke({
                        color: '#fff'
                    }),
                    fill: new ol.style.Fill({
                        color: "#38c"
                    })
                }),
                text: new ol.style.Text({
                    text: size == 1 ? "●" : size.toString(),
                    fontSize: radius * 1.5 - 5,
                    fill: new ol.style.Fill({
                        color: "white"
                    })
                })
            })];
                          
              styleCache[size] = style;
            }
            if(size==1)
              {   
                var features=feature.get('features');
                var precio=features[0].get('precio');
                style = [new ol.style.Style({
                  text: new ol.style.Text({
                    text: pdiValue == 1 ? '\uf19d'+Math.floor(precio)+"€" : '\uf041'+Math.floor(precio)+"€",
                    font: 'normal 13px FontAwesome',
                    textBaseline: 'top',
                    fill: new ol.style.Fill({
                      color: "white"
                    }),
                    stroke: new ol.style.Stroke({
                      color: '#38c',
                      opacity: 0.5,
                      width: 7
                    })
                  })
                })];
              }   
            return style;
        }
      });
    map.addLayer(clusterLayer);
   /* function reloadPoiLayer(p,geo,callback)
    {
      lastCoordinate=p;
      //map.removeLayer(lastLayer);
      vectorSource.clear();

      //var coord=ol.proj.transform(p, 'EPSG:3857', 'EPSG:4326');
      getCalles(vectorSource,p[0],p[1],function() {
        /*var vector_layer = new ol.layer.Vector({
            name: "vectorLayer",
            source: vectorSource,
            style: styleFunction
          });
         

        // it needs a layer too
        
         //lastLayer = clusterLayer;
         if(geo){
          lastPosition=p; 
         }
         //console.log(lastLayer.getSource().getFeatures());
         //map.addLayer(vector_layer);
         
         callback();
      });
    }
    function addPoiSource(longitud,latitud,name,precio,c_mun_via,localidad,_callback){
     // console.log(color);
      var feature=new ol.Feature({
        geometry: new ol.geom.Point([longitud,latitud]),
        precio: precio,
        name: name,
        localidad: localidad,
        c_mun_via: c_mun_via
      });
      //console.log(feature);
      vectorSource.addFeature(feature); 
      _callback();
    }*/        
    function addSource(longitud,latitud,name,precio,c_mun_via,localidad,max_renta,min_renta,_callback){
     // console.log(color);
      var feature=new ol.Feature({
        geometry: new ol.geom.Point([longitud,latitud]),
        precio: precio,
        name: name,
        localidad: localidad,
        c_mun_via: c_mun_via,
        max_renta: max_renta,
        min_renta: min_renta
      });
      //console.log(feature);
      vectorSource.addFeature(feature); 
      _callback();
    }

    function errorLocation(){
        console.log(new Date(), "error de localizacion");
    }
    function successLocation()
    {
        //console.log("LOCALIZADO");
        //geolocation.bindTo('projection', view);
        //marker.bindTo('position', geolocation);
    }
}
      