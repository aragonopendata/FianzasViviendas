
var comboplete;   // Variable con los nombres de las calles/Pois bloque1
var comboplete2;  // Variable con los nombres de las calles/Pois bloque2
$( document ).ready(function() {

  //var inputWidth=$("#calles1").height();
  //$("#calles1").css("height",inputWidth+"px");



  /// inicializo los autocompletables

  comboplete = new Awesomplete('#calles1', {
    minChars: 0
  });
  Awesomplete.$('#drop').addEventListener("click", function() {
    if (comboplete.ul.childNodes.length === 0) {
      comboplete.minChars = 0;
      comboplete.evaluate();
    }
    else if (comboplete.ul.hasAttribute('hidden')) {
      comboplete.open();
    }
    else {
      comboplete.close();
    }
  });

   comboplete2 = new Awesomplete('#calles2', {
    minChars: 0
  });
  Awesomplete.$('#drop2').addEventListener("click", function() {
    if (comboplete2.ul.childNodes.length === 0) {
      comboplete2.minChars = 2;
      comboplete2.evaluate();
    }
    else if (comboplete2.ul.hasAttribute('hidden')) {
      comboplete2.open();
    }
    else {
      comboplete2.close();
    }
  });

  var combopleteLocalidad = new Awesomplete('#localidad1', {
    minChars: 2
  });

    Awesomplete.$('#dropLoc').addEventListener("click", function() {
    if (combopleteLocalidad.ul.childNodes.length === 0) {
      combopleteLocalidad.minChars = 0;
      combopleteLocalidad.evaluate();
    }
    else if (combopleteLocalidad.ul.hasAttribute('hidden')) {
      combopleteLocalidad.open();
    }
    else {
      combopleteLocalidad.close();
    }
  });



  var combopleteLocalidad2 = new Awesomplete('#localidad2', {
    minChars: 2
  });
  Awesomplete.$('#dropLoc2').addEventListener("click", function() {
    if (combopleteLocalidad2.ul.childNodes.length === 0) {
      combopleteLocalidad2.minChars = 2;
      combopleteLocalidad2.evaluate();
    }
    else if (combopleteLocalidad2.ul.hasAttribute('hidden')) {
      combopleteLocalidad2.open();
    }
    else {
      combopleteLocalidad2.close();
    }
  });

  // Inicializo los combos de localidades. Se calculan una vez y no cambian.
  var localidades=[];
  fetchLocalidades(localidades,function(){
    combopleteLocalidad.list=localidades;
    combopleteLocalidad2.list=localidades;
  });

  //Eventos al seleccionar una localidad

  document.querySelector('#localidad1').addEventListener('awesomplete-selectcomplete', function(evt){
    selectLocalidad("1",this.value)
  });

  document.querySelector('#localidad2').addEventListener('awesomplete-selectcomplete', function(evt){
    selectLocalidad("2",this.value)
  });

  //Eventos al seleccionar una calle/Pdi

  document.querySelector('#calles1').addEventListener('awesomplete-selectcomplete', function(evt){
    cambiaCalle("1")
  });

  document.querySelector('#calles2').addEventListener('awesomplete-selectcomplete', function(evt){
    cambiaCalle("2");
  });

  var tooltipSlider = document.getElementById('slider');
  var d = new Date();
  var n = d.getFullYear();

  noUiSlider.create(tooltipSlider, {
    start: [defaultAño-5, defaultAño],
    limit: 5,
    tooltips: [ wNumb({ decimals: 0 }), wNumb({ decimals: 0 }) ],
    behaviour: 'drag',
    connect: true,
    range: {
      'min': 1996,
      'max': n
    }
  });

  slider.noUiSlider.on('end', function(){
    if($("#calles1").val!="" && $("#calles2").val!=""){
      loadChart(hideSpinner);
    }
  });
  $(".noUi-handle").addClass("sliderAños")
  $(".noUi-handle").removeClass("noUi-handle")
});

var db = openDatabase('mydb', '1.0', 'Test DB', 2 * 1024 * 1024);

var view //la vista del mapa
function goToMap(localidad,calle){
  var tabla="coordenadasCalle"
  var col_id="c_mun_via"
  if(pdiValue==1)
  {
    tabla="infoPois"
    col_id="id_poi"

  }
  var queryLatLong="SELECT lat,long from "+tabla+" where c_mun_via in(select c_mun_via from nombreCalle where localidad='"+localidad+"' and etiqueta='"+calle+"') limit 1"
  if(pdiValue==1)
  {
    queryLatLong="SELECT lat,long from infoPois where localidad='"+localidad+"' and etiqueta='"+calle+"' limit 1"
  }
  db.transaction(function(tx){
    tx.executeSql(queryLatLong,[],function(tx,results){
      var latitud=results.rows.item(0).lat;
      var longitud=results.rows.item(0).long;
      var coordenadas=[longitud,latitud]
      view.setCenter(coordenadas);
      location.href="#pageone"
      $("#mapLink").addClass("ui-btn-active");
      $("#comparaLink").removeClass("ui-btn-active");
      view.setZoom(17);
    });
  });
}
function calcula(calle,localidad)
{ 
  var lista=[];
  if(pdiValue==1)
  {
    fetchPois(lista,localidad,function(){
      comboplete.list=lista
    });
  }
  else
  {
    fetchdetails(lista,localidad,function(){
      comboplete.list=lista
    });
  }
  if(($("#calles2").val()=="" && $("#calles1").val!="") && $("#calles1").val()!=calle)         /// cuando en el mapa elijo una calle y en el comparador tengo una solo en el primer bloque, paso el que tenia al 2, y añado a comparar
  {
    var loc1=$("#localidad1").val()     
    $("#calles2").val($("#calles1").val())
    $("#localidad2").val(loc1)
    $("#textoPrincipal2").text($("#textoPrincipal1").text())
    $("#textoSecundario2").text($("#textoSecundario1").text())
    $("#goToMap2").attr("onclick","goToMap('"+$("#localidad1").val()+"','"+$("#calles1").val()+"')")
    $(".calle2").prop("disabled","")
    var nombres=[]
     
    fetchdetails(nombres,loc1,function(){
      comboplete2.list=nombres
    });
  }
  $(".calle1").prop('disabled', "");
  $("#calles1").val(calle);
  $("#localidad1").val(localidad);
  $("#textoPrincipal1").text(calle)
  $("#textoSecundario1").text(localidad)
  $("#goToMap1").attr("onclick","goToMap('"+localidad+"','"+calle+"')")
  $("#historial1").empty()
  acortaTextosCalles();
  //window.plugins.spinnerDialog.show(null, "Calculando Histórico", true); 
  $( "#graph" ).empty()
  $("#mapLink").removeClass("ui-btn-active");
  $("#comparaLink").addClass("ui-btn-active");
  reloadChart=true;   // Este flag hace que al cambiar de página se recargue el gráfico
  location.href="#pagetwo"
}

function fillData(años,valores2,results,callback)
{
  for(var i=0;i<results.rows.length;i++){
    var año2=results.rows.item(i).anyo;
    var precio2=results.rows.item(i).max_renta;
    var media=results.rows.item(i).media_renta;
    var min2=results.rows.item(i).min_renta;
    años.push(año2);
    var precios2=[];
    precios2.push(precio);
    precios2.push(min2);
    precios2.push(media);
    for(var j=0;j<precios2.length;j++)
    {
      if(precios2[j]!=undefined)
      {
        var datos2=[año2,precios[j]];
        valores2.push(datos2);

      }
    }  
  }
  callback();
}


//var chart=null;
function loadChart(callback){
  window.plugins.spinnerDialog.show(null, "Calculando Histórico", true); 
  var nom=$("#calles1").val()
  var nom2=$("#calles2").val()

  if(!(nom=="" && nom2==""))
  {     
    var valores=[];
    var sliderValues=a=$(".noUi-handle > div");
    var localidad=$("#localidad1").val();
    var valores2=[];
    var nombre2=$("#calles2").val();
    var localidad2=$("#localidad2").val();
    var años=[];
    getPoints(nom,localidad,valores,años,function(){
      if(nombre2!=""){
        getPoints(nombre2,localidad2,valores2,años,function(){
          scatterChart(valores,nom,localidad,valores2,nombre2,localidad2,años,function(){
            if(callback!=undefined)
            {
              callback();
            }  
          });
        })
      }else{
        scatterChart(valores,nom,localidad,valores2,nombre2,localidad2,años,function(){
          if(callback!=undefined)
          {
            callback();
          }  
        });
      }
    })
    
  }
  else
  {
    callback()
  }
}

function getPoints(nombre,localidad,valores,años,callback)
{
  var sliderValues=$(".sliderAños > div");
  var minAño=sliderValues[0].textContent;
  var maxAño=sliderValues[1].textContent;
  var query
  if(pdiValue==0)
  {
    query="SELECT anyo,max_renta,media_renta,min_renta FROM infoCalles WHERE etiqueta='"+nombre+"' and localidad='"+localidad+"' and eslocal='"+localValue+"' and anyo<="+maxAño+" and anyo>="+minAño+" group by c_mun_via,anyo";
  }
  else
  {
    query="SELECT anyo,precio_max as max_renta,precio_min as min_renta,precio_medio as media_renta FROM infoPois WHERE etiqueta='"+nombre+"' and localidad='"+localidad+"' and eslocal='"+localValue+"' and anyo<="+maxAño+" and anyo>="+minAño+" group by id_poi,anyo";
  }
  db.transaction(function(tx){ 
    tx.executeSql(query,[],function(tx,results){
      for(var i=0;i<results.rows.length;i++){
        var año=results.rows.item(i).anyo;
        var precio=results.rows.item(i).max_renta;
        var media=results.rows.item(i).media_renta;
        var min2=results.rows.item(i).min_renta;
        var precios=[];
        años.push(año);
        precios.push(precio);
        precios.push(min2);
        precios.push(media);
        for(var j=0;j<precios.length;j++)
        {
          if(precios[j]!=undefined)
          {
            var datos=[año,precios[j]];
            valores.push(datos);
          }
        }
      }
      callback();   
    });    
  });
}

function scatterChart(valores,nombre,localidad,valores2,nombre2,localidad2,años,callback){
  $( "#graph" ).empty()
    //d3.select("svg").remove();
    $(".tooltip").remove();
  if(valores2.length<1 && valores.length<1)
  {
    $( "#graph" ).append( "<p><a>No Hay datos para estos años<a></p>" );
    callback()
  }
  else
  {
    var bodyWidth=$("body").width();
    var sliderValues=$(".sliderAños > div");
    var minAño=sliderValues[0].textContent;
    var maxAño=sliderValues[1].textContent;
    if(maxAño==minAño)
    {
      minAño=minAño-5;
      maxAño=maxAño+5;
    }
    var sliderTop=$("#slider").offset().top
    var flipsTop=$("#bottomElements").offset().top
    var margin = {top: 20, right: 60, bottom: 60, left: 40}
      , width = bodyWidth - margin.left - margin.right
      , height =flipsTop - sliderTop-70;
    
    var x = d3.scale.linear()
              .domain([minAño,maxAño])
               .range([ 0, width ]);
    
    var y = d3.scale.linear()
            .domain([0, d3.max(valores.concat(valores2), function(d) { return d[1]; })])
            .range([ height, 0 ]);

     chart = d3.select('#graph')
      .append('svg:svg')
      .attr('width', width + margin.right + margin.left)
      .attr('height', height + margin.top + margin.bottom)
      .attr('class', 'chart')
      .on("click", function(d) {
            tooltip.transition()
                 .duration(200)
                 .style("opacity", 0)
            });

    var main = chart.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'main')   
        
    // draw the x axis
    var xAxis = d3.svg.axis().scale(x)
      .orient("bottom").tickFormat(d3.format("d"));
    main.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .attr('class', 'main axis date')
      .call(xAxis);

    // draw the y axis
    var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left');

    main.append('g')
      .attr('transform', 'translate(0,0)')
      .attr('class', 'main axis date')
      .call(yAxis);

      var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    var xValue = function(d) { return d;} // data -> value

    var xMap = function(d) { return xScale(xValue(d));} // data -> display

    var yValue = function(d) { return d;} // data -> value

    var yMap = function(d) { return yScale(yValue(d));} // data -> display

    
    var g = main.append("svg:g"); 
      g.selectAll("scatter-dots")
        .data(valores)
        .enter().append("svg:circle")
        .attr("color","#38c")
        .attr("cx", function (d,i) { return x(d[0]); } )
        .attr("cy", function (d) { return y(d[1]); } )
        .attr("r", 8)
        .attr("class", function(d) {
          var clase=getColor(valores,d);
          return clase;
        })
        .on("mouseover", function(d) {  
          $(".tooltip").empty();
          var clase=getColor(valores,d);
          var col=pdiValue==0 ? "media_renta":"precio_medio"
          if(clase=="top"){
            col=pdiValue==0 ? "max_renta":"precio_max"
          }
          else if(clase=="bottom"){
            col=pdiValue==0 ? "min_renta":"precio_min"
          }
          db.transaction(function(tx){ 
            var query= pdiValue==0 ? "select "+col+" as valor from infoCalles where etiqueta='"+nombre+"' and localidad='"+localidad+"' and anyo<"+d[0]+" and eslocal='"+localValue+"' order by anyo desc limit 1"
         : "SELECT "+col+" as valor from infoPois where etiqueta='"+nombre+"' and localidad='"+localidad+"' and anyo<"+d[0]+" and eslocal='"+localValue+"' order by anyo desc limit 1"
            tx.executeSql(query,[],function(tx,results){
              var icon='<i class="fa fa-arrow-circle-down" aria-hidden="true"></i>'
              if(results.rows.length>0)
              {
                var lastValor=results.rows.item(0).valor
                if(lastValor==d[1])
                {
                  icon='<i class="fa fa-minus-circle" aria-hidden="true"></i>'
                }
                else if(lastValor<d[1])
                {
                  icon='<i class="fa fa-arrow-circle-up" aria-hidden="true"></i>'
                }
                tooltip.transition()      
                 .style("opacity", .9);
                tooltip.html('<p><b>'+nombre+','+localidad+'</b></p><p><b>Año:</b>'+d[0]+'</p><p><b>Precio:</b> '+d[1]+'€ '+icon+'  </p>')
              }
              else
              {
                tooltip.transition()      
                 .style("opacity", .9);
                tooltip.html('<p><b>'+nombre+','+localidad+'</b></p><p><b>Año:</b>'+d[0]+'</p><p><b>Precio:</b> '+d[1]+'€ <i class="fa fa-arrow-circle-up" aria-hidden="true"></i> </p>')
              }
            })
          }) 
          var left=d3.event.pageX
          if(d[0]>maxAño-2){
            left=left-90
          }
          var top=d3.event.pageY-90
          
          var precios=[]
          for(var i=0;i<valores.length;i++){
            precios.push(valores[i][1])
          }
          precios=precios.sort(function compareNumbers(a, b) {return b - a;})
          if(d[1]==precios[0])
          {
            top+=90
          }
          tooltip.style("left", (left) + "px")   
                 .style("top", (top) + "px")          
      })      
    if(valores2.length>0)    
    {
      g.selectAll("scatter-dots")
        .data(valores2)
        .enter().append("svg:circle")
        .attr("cx", function (d,i) { return x(d[0]); } )
        .attr("cy", function (d) { return y(d[1]); } )
        .attr("r", 8)
        .attr("class", function(d) {
          var clase=getColor(valores2,d);
          return "secondary"+clase;
        })
        .on("mouseover", function(d) { 
          $(".tooltip").empty();
          var clase=getColor(valores2,d);
          var col=pdiValue==0 ? "media_renta":"precio_medio"
          if(clase=="top"){
            col=pdiValue==0 ? "max_renta":"precio_max"
          }
          else if(clase=="bottom"){
            col=pdiValue==0 ? "min_renta":"precio_min"
          }
          db.transaction(function(tx){ 
             var query= pdiValue==0 ? "select "+col+" as valor from infoCalles where etiqueta='"+nombre2+"' and localidad='"+localidad2+"' and anyo<"+d[0]+" and eslocal='"+localValue+"' order by anyo desc limit 1"
         : "SELECT "+col+" as valor from infoPois where etiqueta='"+nombre2+"' and localidad='"+localidad2+"' and anyo<"+d[0]+" and eslocal='"+localValue+"' order by anyo desc limit 1"
            tx.executeSql(query,[],function(tx,results){
              var lastValor
              var icon='<i class="fa fa-arrow-circle-down" aria-hidden="true"></i>'
              if(results.rows.length>0)
              {
                var lastValor=results.rows.item(0).valor
                if(lastValor==d[1])
                {
                  icon='<i class="fa fa-minus-circle" aria-hidden="true"></i>'
                }
                else if(lastValor<d[1])
                {
                  icon='<i class="fa fa-arrow-circle-up" aria-hidden="true"></i>'
                }
                tooltip.transition()      
                 .style("opacity", .9);
                tooltip.html('<p><b>'+nombre2+','+localidad2+'</b></p><p><b>Año:</b>'+d[0]+'</p><p><b>Precio:</b> '+d[1]+'€ '+icon+'  </p>')
              }
              else
              {
                tooltip.transition()      
                 .style("opacity", .9);
                tooltip.html('<p><b>'+nombre2+','+localidad2+'</b></p><p><b>Año:</b>'+d[0]+'</p><p><b>Precio:</b> '+d[1]+'€ <i class="fa fa-arrow-circle-up" aria-hidden="true"></i> </p>')
              }
            })
          }) 
          var left=d3.event.pageX
          if(d[0]>maxAño-2){
            left=left-90
          }
          var top=d3.event.pageY-90
          
          var precios=[]
          for(var i=0;i<valores2.length;i++){
            precios.push(valores2[i][1])
          }
          precios=precios.sort(function compareNumbers(a, b) {return b - a;})
          if(d[1]==precios[0])
          {
            top+=90
          }
          tooltip.style("left", (left) + "px")   
                 .style("top", (top) + "px")
        })
    }
    callback();  
  }  
}

function getColor(valores,dato)  //Devuelve la clase de cada punto en el gráfico top-medio-bottom
{
  if(valores.length==1)
  {
    return "medio";
  }
  var año=dato[0]
  var valorDato=dato[1]
  var datosAño=[]
  for(var i=0;i<valores.length;i++)
  {
    if(valores[i]!=dato)
    {
      if(valores[i][0]==año)
      {
        datosAño.push(valores[i][1]);
      }
    }
    
  }
  if(datosAño.length==1 && valorDato>datosAño[0][1])
  {
    return "top";
  }
  else
  {
    if(datosAño.length==1)
    {
      return "bottom";
    }
    else
    {
      if(valorDato > Math.max.apply(Math,datosAño))
      {
        return "top";
      }
      else
      {
        if(valorDato < Math.min.apply(Math,datosAño))
        {
          return "bottom";
        }
        else
        {
          return "medio";
        }
      }
    }
  }
}

function resize() {


    var bodyWidth=$("body").width();
    var margin = {top: 20, right: 15, bottom: 60, left: 60};
  
    width = bodyWidth - margin.left - margin.right
    height = 200 - margin.top - margin.bottom;
    x.range([0, width]);
    y.range([height, 0]);
}
//d3.select(window).on('resize', resize);

function fetchdetails(nombres,localidad,calback){
  
  var query="SELECT etiqueta FROM nombreCalle where localidad='"+localidad+"' order by etiqueta DESC";
  db.transaction(function(tx){
    tx.executeSql(query,[],function(tx,results){
        for(var i=0;i<results.rows.length;i++){
          var nombre=results.rows.item(i).etiqueta;
          //var c_mun_via=results.rows.item(i).c_mun_via;
          nombres.push(nombre);
         /* $('#filter-menu').append($('<option>', {
              value: c_mun_via,
              text: nombre
          }));*/
        }
        calback();
    });
  });
}

function fetchPois(nombres,localidad,calback){
  
  var query="SELECT etiqueta FROM pois where localidad='"+localidad+"' order by etiqueta DESC";
  db.transaction(function(tx){
    tx.executeSql(query,[],function(tx,results){
        for(var i=0;i<results.rows.length;i++){
          var nombre=results.rows.item(i).etiqueta;
          //var c_mun_via=results.rows.item(i).c_mun_via;
          nombres.push(nombre);
         /* $('#filter-menu').append($('<option>', {
              value: c_mun_via,
              text: nombre
          }));*/
        }
        calback();
    });
  });
}
function fetchLocalidades(nombres,calback){
  var query="SELECT localidad FROM localidad order by localidad desc";
  db.transaction(function(tx){
    tx.executeSql(query,[],function(tx,results){
        for(var i=0;i<results.rows.length;i++){
          var nombre=results.rows.item(i).localidad;
          
          nombres.push(nombre);

        }
        calback();
    });
  });
}
function clearCalle(id){
  $(".tooltip").remove();
  $("#graph").empty()
  if(id=="calles1")
  {
    $("#calles1").val("");
    $("#localidad1").val("");
    $("#textoPrincipal1").text("Seleccionar elemento...")
    $("#textoSecundario1").text("")
    if($("#calles2").val()!="")
    {
      loadChart(hideSpinner);
    }
  }
  if(id=="calles2")
  {
    $("#calles2").val("");
    $("#localidad2").val("");
    $("#textoPrincipal2").text("Seleccionar elemento...")
    $("#textoSecundario2").text("")
    if($("#calles1").val()!="")
    {
      loadChart(hideSpinner);
    }
  }
}

function selectLocalidad(id,localidad)
{
  var nombres=[];
  $(".tooltip").remove();
  $("#graph").empty()
  var id2 = (id==1) ? "2" : "1"
  if($("#calles"+id2).val()!="")
  {
    loadChart(hideSpinner);
  }
  $("#calles"+id).val("");
  if(pdiValue==1)
  {
    fetchPois(nombres,localidad,function(){
      if(id==1)
      {
        comboplete.list=nombres;  
      }
      if(id==2)
      {
        comboplete2.list=nombres;
      }
    });
  }
  else
  {
    fetchdetails(nombres,localidad,function(){
      if(id==1)
      {
        comboplete.list=nombres;  
      }
      if(id==2)
      {
        comboplete2.list=nombres;
      }
    });
  }
  $(".calle"+id).prop('disabled', "");
  $("#goToMap"+id).attr("onclick","")
  $("#textoPrincipal"+id).text("")
  $("#textoSecundario"+id).text(localidad)
}
function hideSpinner()
{
  window.plugins.spinnerDialog.hide()
}

function cambiaCalle(id)
{
  loadChart(hideSpinner)
  var localidad=$("#localidad"+id).val()
  var calle=$("#calles"+id).val()
  $("#textoPrincipal"+id).text(calle)
  $("#textoSecundario"+id).text(localidad)
  acortaTextosCalles();
  $("#itemComparar"+id).popup("close")
  $("#goToMap"+id).attr("onclick","goToMap('"+localidad+"','"+calle+"')")
  $("#historial"+id).empty();
  db.transaction(function(tx){
    if(pdiValue==0)
    {
      var queryCalle="select c_mun_via from infoCalles where localidad='"+localidad+"' and etiqueta='"+calle+"'"
      tx.executeSql(queryCalle,[],function(tx,results){
        var c_mun_via=results.rows.item(0).c_mun_via;
        db.transaction(function(tx){
          var query="insert into historial(c_mun_via,localidad,calle,fecha,espdi) values('"+c_mun_via+"','"+localidad+"','"+calle+"',datetime('now'),'0')";
          tx.executeSql(query);
        })  
      });
    }
    else
    {
      tx.executeSql("select id_poi from infoPois where localidad='"+localidad+"' and etiqueta='"+calle+"'",[],function(tx,results){
        var id_poi=results.rows.item(0).id_poi;
        db.transaction(function(tx){
          var query="insert into historial(c_mun_via,localidad,calle,fecha,espdi) values('"+id_poi+"','"+localidad+"','"+calle+"',datetime('now'),'1')";
      tx.executeSql(query);
        })  
      });
      
    }
    
  });
}