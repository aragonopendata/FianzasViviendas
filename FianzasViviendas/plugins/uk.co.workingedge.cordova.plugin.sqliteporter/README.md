SQLite Porter Cordova/Phonegap Plugin
=================================

## Contents

* [Overview](#overview)
* [Installation](#installation)
* [Usage](#usage)
* [JSON import optimisations](#json-import-optimisations)
* [Example projects](#example-projects)
* [License](#license)

# Overview

This Cordova/Phonegap plugin can be used to import/export to/from a SQLite database using either SQL or JSON.

- Works on all Cordova platforms that [support HTML5 WebSQL DB in the WebView](http://docs.phonegap.com/en/4.0.0/cordova_storage_storage.md.html):
    - Android
    - iOS
    - Tizen
    - Blackberry 10
- Works for native SQLite DB via a [plugin](https://github.com/litehelpers/Cordova-sqlite-storage).
This can be used for platforms that don't have WebSQL in WebView (e.g. Windows) or for unlimited storage on platforms that do:
    - Android
    - iOS
    - Amazon Fire-OS
    - Windows Universal (8.1)
    - Windows Phone 7
    - Windows Phone 8
- Import/export either just the table data or the entire table structure as well.

The plugin is registered on [npm](https://www.npmjs.com/package/uk.co.workingedge.cordova.plugin.sqliteporter) as `uk.co.workingedge.cordova.plugin.sqliteporter`

## Usage scenarios

- Create and populate a database from a database dump.
- Update an existing database by importing inserts/updates/deletes.
- Export and send data from a database.

# Installation

## Using the Cordova/Phonegap [CLI](http://docs.phonegap.com/en/edge/guide_cli_index.md.html)

    $ cordova plugin add uk.co.workingedge.cordova.plugin.sqliteporter
    $ phonegap plugin add uk.co.workingedge.cordova.plugin.sqliteporter

**NOTE**: Make sure your Cordova CLI version is 5.0.0+ (check with `cordova -v`). Cordova 4.x and below uses the now deprecated [Cordova Plugin Registry](http://plugins.cordova.io) as its plugin repository, so using a version of Cordova 4.x or below will result in installing an [old version](http://plugins.cordova.io/#/package/uk.co.workingedge.cordova.plugin.sqliteporter) of this plugin.

## Using [Cordova Plugman](https://github.com/apache/cordova-plugman)

    $ plugman install --plugin=uk.co.workingedge.cordova.plugin.sqliteporter --platform=<platform> --project=<project_path> --plugins_dir=plugins

For example, to install for the Android platform

    $ plugman install --plugin=uk.co.workingedge.cordova.plugin.sqliteporter --platform=android --project=platforms/android --plugins_dir=plugins

## PhoneGap Build
Add the following xml to your config.xml to use the latest version of this plugin from [npm](https://www.npmjs.com/package/uk.co.workingedge.cordova.plugin.sqliteporter):

    <gap:plugin name="uk.co.workingedge.cordova.plugin.sqliteporter" source="npm" />

# Usage

The plugin is exposed via the `cordova.plugins.sqlitePorter` object and provides the following functions:

- [importSqlToDb()](#importsqltodb)
- [exportDbToSql()](#exportdbtosql)
- [importJsonToDb()](#importjsontodb)
- [exportDbToJson()](#exportdbtojson)
- [wipeDb()](#wipedb)

## importSqlToDb()

Executes a set of SQL statements against the defined database.
Can be used to import data defined in the SQL statements into the database, and may additionally include commands to create the table structure.

    cordova.plugins.sqlitePorter.importSqlToDb(db, sql, opts);

### Parameters

- {Database} db - open SQLite database to import into
- {string} sql - SQL statements to execute against database.
- {object} opts - optional parameters:
    - {function} successFn - callback function to execute once import is complete, called with arguments:
        - {integer} count - total number of statements executed in the given SQL string.
    - {function} errorFn - callback function to execute on error during import, called with arguments:
        - {object} error - object representing the error.
    - {function} progressFn - callback function to execute after each successful execution of SQL statement, called with arguments:
        - {object} count - number of statements executed so far.
        - {integer} totalCount - total number of statements in the given SQL string.

### Example usage

Create a database from a SQL dump

    var db = window.openDatabase("Test", "1.0", "TestDB", 1 * 1024);
    var sql = "CREATE TABLE Artist ([Id] PRIMARY KEY, [Title]);"+
        "INSERT INTO Artist(Id,Title) VALUES ('1','Fred');";
    var successFn = function(count){
        alert("Successfully imported "+count+" SQL statements to DB");
    };
    var errorFn = function(error){
        alert("The following error occurred: "+error.message);
    };
    var progressFn = function(current, total){
        console.log("Imported "+current+"/"+total+" statements";
    };
    cordova.plugins.sqlitePorter.importSqlToDb(db, sql, {
        successFn: successFn,
        errorFn: errorFn,
        progressFn: progressFn
    });


Update an existing database

    var db = window.openDatabase("Test", "1.0", "TestDB", 1 * 1024);
    var sql = "INSERT INTO Artist(Id,Title) VALUES ('6','Jane');"+
        "UPDATE Artist SET Title='Susan' WHERE Id='2';"+
        "DELETE FROM Artist WHERE Id='5';";
    var successFn = function(count){
        alert("Successfully imported "+count+" SQL statements to DB");
    };
    var errorFn = function(error){
        alert("The following error occurred: "+error.message);
    };
    var progressFn = function(current, total){
        console.log("Imported "+current+"/"+total+" statements";
    };
    cordova.plugins.sqlitePorter.importSqlToDb(db, sql, {
        successFn: successFn,
        errorFn: errorFn,
        progressFn: progressFn
    });

## exportDbToSql()

Exports a SQLite DB as a set of SQL statements.

    cordova.plugins.sqlitePorter.exportDbToSql(db, opts);

### Parameters

- {Database} db - open SQLite database to export
- {object} opts - optional parameters:
    - {function} successFn - callback function to execute after export is complete, with arguments:
        - {string} sql - exported SQL statements combined into a single string.
        - {integer} count - number of SQL statements in exported string.
    - {boolean} dataOnly - if true, only row data will be exported. Otherwise, table structure will also be exported. Defaults to false.

### Example usage

    var db = window.openDatabase("Test", "1.0", "TestDB", 1 * 1024);
    var successFn = function(sql, count){
        console.log("Exported SQL: "+sql);
        alert("Exported SQL contains "+count+" statements");
    };
    cordova.plugins.sqlitePorter.exportDbToSql(db, {
        successFn: successFn
    });

## importJsonToDb()

Converts table structure and/or row data contained within a JSON structure into SQL statements that can be executed against a SQLite database.
Can be used to import data into the database and/or create the table structure.

    cordova.plugins.sqlitePorter.importJsonToDb(db, json, opts);

### Parameters

- {Database} db - open SQLite database to import into
- {string/object} json - JSON structure containing row data and/or table structure as either a JSON object or string
- {object} opts - optional parameters:
    - {function} successFn - callback function to execute once import is complete, called with arguments:
        - {integer} count - total number of statements executed in the given SQL string.
    - {function} errorFn - callback function to execute on error during import, called with arguments:
        - {object} error - object representing the error.
    - {function} progressFn - callback function to execute after each successful execution of SQL statement, called with arguments:
        - {object} count - number of statements executed so far.
        - {integer} totalCount - total number of statements in the given SQL string.
    - {integer} batchInsertSize - maximum number of inserts to batch into a SQL statement using UNION SELECT method.
    Defaults to 250 if not specified. Set to 1 to disable batching and perform 1 insert per SQL statement.
    You can tweak this to optimize performance but numbers higher than 500 may cause the app to run out of memory and crash.

### Example usage
Create a database from a SQL dump

    var db = window.openDatabase("Test", "1.0", "TestDB", 1 * 1024);
    var json = {
        "structure":{
            "tables":{
                "Artist":"([Id] PRIMARY KEY, [Title])"
            },
           "otherSQL": [
                "CREATE UNIQUE INDEX Artist_ID ON Artist(Id)"
           ]
        },
        "data":{
            "inserts":{
                "Artist":[
                    {"Id":"1","Title":"Fred"},
                    {"Id":"2","Title":"Bob"},
                    {"Id":"3","Title":"Jack"},
                    {"Id":"4","Title":"John"}
                ]
            }
        }
    };
    var successFn = function(count){
        alert("Successfully imported JSON to DB; equivalent to "+count+" SQL statements");
    };
    var errorFn = function(error){
        alert("The following error occurred: "+error.message);
    };
    var progressFn = function(current, total){
        console.log("Imported "+current+"/"+total+" statements";
    };
    cordova.plugins.sqlitePorter.importJsonToDb(db, json, {
        successFn: successFn,
        errorFn: errorFn,
        progressFn: progressFn,
        batchInsertSize: 500
    });


Update an existing database

    var db = window.openDatabase("Test", "1.0", "TestDB", 1 * 1024);
    var json = {
        "data":{
            "inserts":{
                "Artist":[
                    {"Id":"1","Title":"Fred"},
                    {"Id":"2","Title":"Bob"}
                ]
            },
            "updates":{
                "Artist":
                    [
                        {
                            "set": {"Title":"Jill"},
                            "where": {"Id":"3"}
                        },
                        {
                            "set": {"Title":"Susan"},
                            "where": {"Id":"4"}
                        }
                    ]
                },
                "deletes":{
                    "Artist":[
                        {"Id":"5"},
                        {"Id":"6"}
                    ]
                }
            }
        }
    };
    var successFn = function(count){
        alert("Successfully imported JSON to DB; equivalent to "+count+" SQL statements");
    };
    var errorFn = function(error){
        alert("The following error occurred: "+error.message);
    };
    var progressFn = function(current, total){
        console.log("Imported "+current+"/"+total+" statements";
    };
    cordova.plugins.sqlitePorter.importJsonToDb(db, json, {
        successFn: successFn,
        errorFn: errorFn,
        progressFn: progressFn
    });

## exportDbToJson()

Exports a SQLite DB as a JSON structure

    cordova.plugins.sqlitePorter.exportDbToJson(db, opts);

### Parameters

- {Database} db - open SQLite database to export
- {object} opts - optional parameters:
    - {function} successFn - callback function to execute after export is complete, with arguments:
        - {object} json - exported JSON structure.
        - {integer} count - number of SQL statements that exported JSON structure corresponds to.
    - {boolean} dataOnly - if true, only row data will be exported. Otherwise, table structure will also be exported. Defaults to false.

### Example usage

    var db = window.openDatabase("Test", "1.0", "TestDB", 1 * 1024);
    var successFn = function(json, count){
            console.log("Exported JSON: "+json);
            alert("Exported JSON contains equivalent of "+count+" SQL statements");
        };
    cordova.plugins.sqlitePorter.exportDbToJson(db, {
        successFn: successFn
    });

## wipeDb()

Wipes all data from a database by dropping all existing tables.

    cordova.plugins.sqlitePorter.wipeData(db, opts);

### Parameters

- {Database} db - open SQLite database to wipe
- {object} opts - optional parameters:
    - {function} successFn - callback function to execute once wipe is complete, called with arguments:
        - {integer} count - number of tables dropped.
    - {function} errorFn - callback function to execute on error during wipe, called with arguments:
        - {object} error - object representing the error.
    - {function} progressFn - callback function to execute after each successful table drop, called with arguments:
        - {object} count - number of tables dropped so far.
        - {integer} totalCount - total number of tables to drop.

### Example usage

    var db = window.openDatabase("Test", "1.0", "TestDB", 1 * 1024);
    var successFn = function(count){
        alert("Successfully wiped "+count+" tables");
    };
    var errorFn = function(error){
        alert("The following error occurred: "+error.message);
    };
    var progressFn = function(current, total){
        console.log("Wiped "+current+"/"+total+" tables";
    };
    cordova.plugins.sqlitePorter.wipeData(db, {
        successFn: successFn,
        errorFn: errorFn,
        progressFn: progressFn
    });

# JSON import optimisations

The JSON structure passed to the [importJsonToDb()](#importjsontodb) function is parsed in order to generate corresponding SQL commands.
In doing so, the following optimisations have been made to minimize time taken to import large amounts of data:

## Batched inserts

When importing large amounts of data to the database, INSERT statements can be time consuming. Therefore, the plugin uses the UNION SELECT method (see [this stackoverflow post](http://stackoverflow.com/a/5009740/777265) for details),
if the JSON structure contains "inserts", to batch multiple inserts in a single SQL statement, which leads to significant performance gains when bulk importing data as to populate a database.

The default batch size is a maximum of 250 inserts per INSERT statement; this can be overridden using the `batchInsertSize` option.
Setting this to 1 disables batching and performs 1 insert per SQL statement.
You can tweak this to optimize performance but numbers higher than 500 may cause the app to run out of memory and crash.

In the [example project](https://github.com/dpa99c/cordova-sqlite-porter-example) illustrating use of this plugin,
the complex database example is actually the [Chinook database](https://chinookdatabase.codeplex.com/) - a sample database which contains over 15,000 INSERTS in the SQL file.
Running the example project on my Samsung Galaxy S4 with no batching, importing the SQL file takes around 300 seconds (5 mins).
Whereas the JSON equivalent, using UNION SELECTs with a batch size of 500, has only 17 INSERT statements and importing this takes around 3 seconds - 100 times faster!

Note: when using the [importSqlToDb()](#importsqltodb), you must make any optimisations in your SQL.

## Delayed index creation

If the JSON structure "otherSql" key contains CREATE INDEX statements, these are executed after all other SQL commands, and in a separate transaction
in order to optimise performance when inserting large amounts of data.

# Example projects

## HTML5 WebSQL

[https://github.com/dpa99c/cordova-sqlite-porter-example](https://github.com/dpa99c/cordova-sqlite-porter-example)

This example project illustrates how the plugin can be used to import/export data from a WebSQL database in the WebView.

## Native SQLite

[https://github.com/dpa99c/cordova-sqlite-porter-example-native-plugin](https://github.com/dpa99c/cordova-sqlite-porter-example-native-plugin)

This example project illustrates how the plugin can be used to import/export data from a native SQLite database using a [native SQLite plugin](https://github.com/litehelpers/Cordova-sqlite-storage)

# License
================

The MIT License

Copyright (c) 2015 Working Edge Ltd.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.