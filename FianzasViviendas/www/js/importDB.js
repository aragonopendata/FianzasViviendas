
var db = openDatabase('mydb', '1.0', 'Test DB', 2 * 1024 * 1024);
var urlServer="http://idearium.eu/fianzas/"
function importJsonToDb()
{
	importCoord()
}
function importCoord()
{
	jQuery.getJSON("json/new/coordenadas_calle2.json", function(datos){
	  cordova.plugins.sqlitePorter.importJsonToDb(db, datos, {
	    successFn: importFianzas,
	    errorFn: errorFn,
	    progressFn: progressFn,
	    batchInsertSize: 500
	  });
	});
}
function importFianzas()
{
	jQuery.getJSON("json/new/fianzas.json", function(datos){
	  cordova.plugins.sqlitePorter.importJsonToDb(db, datos, {
	    successFn: importLocalidades,
	    errorFn: errorFn,
	    progressFn: progressFn,
	    batchInsertSize: 500
	  });
	});
}
function importLocalidades()
{
	jQuery.getJSON("json/new/localidades.json", function(datos){
	  cordova.plugins.sqlitePorter.importJsonToDb(db, datos, {
	    successFn: importNombres,
	    errorFn: errorFn,
	    progressFn: progressFn,
	    batchInsertSize: 500
	  });
	});
}
function importNombres()
{
	jQuery.getJSON("json/new/nombre_calles.json", function(datos){
	  cordova.plugins.sqlitePorter.importJsonToDb(db, datos, {
	    successFn: importPois,
	    errorFn: errorFn,
	    progressFn: progressFn,
	    batchInsertSize: 500
	  });
	});
}
function importPois()
{
	jQuery.getJSON("json/new/pois_new.json", function(datos){
	  cordova.plugins.sqlitePorter.importJsonToDb(db, datos, {
	    successFn: importPreciosPois,
	    errorFn: errorFn,
	    progressFn: progressFn,
	    batchInsertSize: 500
	  });
	});
}
function importPreciosPois()
{
	jQuery.getJSON("json/new/precios_pois.json", function(datos){
	  cordova.plugins.sqlitePorter.importJsonToDb(db, datos, {
	    successFn: createTempTable,
	    errorFn: errorFn,
	    progressFn: progressFn,
	    batchInsertSize: 500
	  });
	});
}
function createTempTable(){
	db.transaction(function(tx){
		tx.executeSql("CREATE TABLE historial(c_mun_via,localidad,calle,espdi,fecha datetime)");
		successFn();	
	});
}

function updateTable(name,base,myVersion,lastVersion,callback)
{
	var i=parseInt(myVersion)+1
	while(i<=lastVersion){
		addUpdate(name,base,i,function(){
			i++
		})
	}
	callback()
}
function addUpdate(name,base,version,callback){
	var url=urlServer+name+"/update/"+base+"/"+version+".json"
	console.log(url)
	jQuery.getJSON(url, function(datos){
	  cordova.plugins.sqlitePorter.importJsonToDb(db, datos, {
	  	successFn: restoreSuccess,
	    errorFn: errorFn,
	    batchInsertSize: 500
	  });
	});
	callback()
}
function restoreTable(name,version)
{
	clearTable(name,function(){
		var url=urlServer+name+"/base/"+version+".json"
		console.log(url)
		jQuery.getJSON(url, function(datos){
		  cordova.plugins.sqlitePorter.importJsonToDb(db, datos, {
		    successFn: restoreSuccess,
		    errorFn: errorFn,
		    batchInsertSize: 500
		  });
		});
	})
}
function clearTable(name,callback)
{
	db.transaction(function(tx){
		tx.executeSql("TRUNCATE TABLE "+name);	
	});
	callback()
}

var restoreSuccess = function(count){
	window.plugins.spinnerDialog.hide();
	//alert("Successfully imported JSON to DB; equivalent to "+count+" SQL statements");
};


var successFn = function(count){
	db.transaction(function(tx){
		tx.executeSql("CREATE TABLE dataVersion(name,base,version)");	
		tx.executeSql("CREATE VIEW infoCalles AS SELECT f.*,n.etiqueta,n.c_mun_via,n.localidad,c.lat,c.long,c.c_x,c.c_y FROM nombreCalle n, fianzas f,coordenadasCalle c WHERE f.c_mun_via=n.c_mun_via and c.c_mun_via=n.c_mun_via");	
		tx.executeSql("CREATE VIEW infoPois AS SELECT pp.*,p.etiqueta,p.localidad,p.lat,p.long FROM precios_pois pp,pois p WHERE p.id=pp.id_poi");
		tx.executeSql("insert into dataVersion(name,base,version) values('coordenadasCalle',1,0)");
		tx.executeSql("insert into dataVersion(name,base,version) values('fianzas',1,0)");
		tx.executeSql("insert into dataVersion(name,base,version) values('pois',1,0)");
		tx.executeSql("insert into dataVersion(name,base,version) values('precios_pois',1,0)");
		tx.executeSql("insert into dataVersion(name,base,version) values('nombreCalle',1,0)");
		window.plugins.spinnerDialog.hide();
		//location.href="#tutorial"
		location.reload()
	});
	//alert("Successfully imported JSON to DB; equivalent to "+count+" SQL statements");
};
function tutorial(){
	$('.single-item').slick();
}
var errorFn = function(error){
	alert("The following error occurred: "+error.message);
};
var progressFn = function(current, total){
	console.log("Imported "+current+"/"+total+" statements");
};