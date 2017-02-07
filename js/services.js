var localDB = new PouchDB("weeklymarket");
//var remoteDB = new PouchDB("http://weeklymarket1873.cloudapp.net:5984/weeklymarket");

var remoteDB = new PouchDB("http://45.40.179.19:5984/weeklymarket");
//var remoteDB = new PouchDB("http://localhost:5984/weeklymarket");

angular.module('starter.services', []).factory('Login', function($rootScope, $http, $ionicLoading, $location, $state, $q, $cookies) {
    var loggedin = false;
    var username = "";
    var password = "";
    var url = "";
    var credentials = {};
    var baseurl;
    var def;
    var loginpromise;
    var SRN;
    var sitecookie;
    var items = [];

    function validate() {
        username = getObject("username");
        password = getObject("password");
        baseurl = getObject("url");
        if (baseurl !== undefined || username !== undefined || password !== undefined) {
            //logoff(false);
            login(username, password, baseurl);
        } else {
            console.log("No Stored Credentials Found");
        }
    }

    function clearlocalstorage() {
        setObject("cookie", "");
        setObject("SRN", "");
        setObject("username", "");
        setObject("password", "");
        setObject("url", "");
    }

    function logoff(clearlocalstorageflag) {
        console.log($cookies.getAll())
        username = getObject("username");
        password = getObject("password");
        baseurl = getObject("url");
        sitecookie = getObject("cookie");
        SRN = getObject("SRN");
        if (url === undefined) return;
        var reqlogoff = $http({
            url: baseurl + "/servicem_enu/start.swe?SWENeedContext=false&SWECmd=Logoff&SWEC=1&SWEBID=-1&SWETS=", //&_sn=" + cookie + "&SRN=" + SRN,
            method: "GET",
            strictSSL: false,
            //cache: false,
            timeout: 30000,
            withCredentials: true
        }).then(function success(response) {
            console.log("success logoff");
            console.log(JSON.stringify(response));
            if (clearlocalstorageflag) {
                clearlocalstorage();
            }
        }, function error(response) {
            console.log("error logoff");
            console.log(response);
        });
        reqlogoff = undefined;
    }
    var EncodeToQueryString = function(d, h) {
        var g = "";
        var a = d.EnumProperties(true);
        var i = 0;
        var b = d.GetPropertyCount();
        var c;
        var e;
        h = (typeof h == "undefined");
        do {
            i++;
            if (typeof d.GetProperty(a) != "function") {
                c = h ? encodeURI(a) : a;
                e = h ? encodeURI(d.GetProperty(a)) : d.GetProperty(a);
                g += (c + "=" + e + (i < b ? "&" : ""))
            }
        } while ((a = d.EnumProperties(false)));
        return g
    };

    function getLoginData() {
        username = getObject("username");
        password = getObject("password");
        baseurl = getObject("url");
        sitecookie = getObject("cookie");
        SRN = getObject("SRN");
    }

    function login(usr, pwd) {
       //var sieburl = "http://weeklymarket1873.cloudapp.net:5984/weeklymarketusers/" + usr;
		 var sieburl = "http://45.40.179.19:5984/weeklymarketusers/" + usr;
		 //var sieburl = "http://localhost:5984/weeklymarketusers/" + usr;
		 //original timeout = 2 * 60 * 1000 i.e. 2 min
        var req = $http({
            url: sieburl,
            method: "GET",
            strictSSL: false,
            timeout: 20 * 1000,            
            withCredentials: true
        }).then(function success(response) {
            
			if(response.data.password===pwd)
			{
				loginpromise.resolve("OK");
			}
			else{
				loginpromise.reject("Invalid Password");
			}
            $ionicLoading.hide();
        }, function error(response) {
            console.log("error");
            if(response.status===404)
					loginpromise.reject("Invalid User");
			else
					loginpromise.reject("Network not available");
			
            $ionicLoading.hide();
            
        });
    }

    function setObject(key, value) {
        //window.localStorage[key] = JSON.stringify(value);
        window.localStorage[key] = value;
    }

    function getObject(key) {
        //return JSON.parse(window.localStorage[key] || '{}');
        return window.localStorage[key];
    }
    return {
        setObject: function(key, value) {
            setObject(key, value);
        },
        getObject: function(key) {
            return (getObject(key));
        },
        setloggedin: function(value) {
            this.loggedin = value;
        },
        getloggedin: function() {
            return this.loggedin;
        },
        seturl: function(value) {
            this.url = url;
        },
        geturl: function() {
            return this.url;
        },
        setcredentials: function(value) {
            this.credentials = value;
            setObject("userLogin", value);
        },
        getcredentials: function() {
            //return this.credentials;
            return (getObject("userLogin"));
        },
        login: function(username, password, url) {
            loginpromise = $q.defer();
            login(username, password, url)
            return (loginpromise.promise);
        },
        validate: function() {
            validate();
        },
        logoff: function() {
            logoff();
        },
        getitem: function(id) {
            var def = $q.defer();
            $ionicLoading.show({
                template: '<ion-spinner class ="spinner-energized" icon="ripple"></ion-spinner>',
                hideOnStageChange: true
            });
            console.log("gettign items");
            items = [];
            var owner = this.getObject("username");
            console.log("getitems - " + owner);
            localDB.get(id, {
                include_docs: true
            }).then(function(result) {
                console.log(result)
                def.resolve(result);
                $ionicLoading.hide();
            })
            return (def.promise);
        },
        getitems: function(doctype,key) {
            var def = $q.defer();
            $ionicLoading.show({
                template: '<ion-spinner class ="spinner-energized" icon="ripple"></ion-spinner>',
                hideOnStageChange: true
            });
            console.log("getting items");
            items = [];
            var owner = this.getObject("username");
            console.log("getitems - " + owner);
            localDB.query('changes_since/'+doctype, {
                "include_docs": true,"key":key
				}).then(function(result) {
				console.log("results got - ");
				console.log(result);
                for (var k in result.rows) {
                    if (result.rows[k].doc['owner'] === owner) items.push(result.rows[k].doc);
                }
                console.log(items);
                def.resolve(items);
				$ionicLoading.hide();
            },function(err){
				console.log(err);
				$ionicLoading.hide();
			})
            return (def.promise);
        },
        startsync: function(usr) {
            console.log("sync start for user - " + usr);
            localDB.sync(remoteDB, {
                live: true,
                retry: true
            }).on('change', function(change) {
                console.log("change detected");
				debugger;
				
				if(change.direction==="push"){
					for(var k in change.object)
					{
						if(change.object[k].doctype !== "attendance")
						{
							console.log("attendance sync detected");
						}
					}
				}
				console.log("change=push");
				$rootScope.$broadcast("syncdone");
                console.log(change);
            }).on('error', function(err) {
                // yo, we got an error! (maybe the user went offline?)
                console.log("error detected");
            }).on('paused', function(err) {
                console.log("paused");
                //$rootScope.$broadcast("syncdone");
            }).on('active', function() {
                console.log("active");
            }).on('denied', function(err) {
                console.log("denied");
            }).on('complete', function(info) {
                console.log("complete");
            });
        },
		goprev:function(){
			console.log("prev");
		},
		push:function(doc){
			var def = $q.defer();
            $ionicLoading.show({
                template: '<ion-spinner class ="spinner-energized" icon="ripple"></ion-spinner>',
                hideOnStageChange: true
            });
			doc.source="mobile";
			localDB.post(doc).then(function(success){
				console.log(success);
				def.resolve(success);
				$ionicLoading.hide();
			},function(error){
				console.log(error);
				def.reject(error);
				$ionicLoading.hide();
			});
			return def.promise;
		},
		getattendancerecords: function(locationid,attendancedate){
				console.log("location id and attendancedate of getattendancerecords ");
			console.log(locationid,attendancedate);
			console.log("include_docs key for getattendancerecords");
			console.log(locationid + "_" + attendancedate);
			var def = $q.defer();
            $ionicLoading.show({
                template: '<ion-spinner class ="spinner-energized" icon="ripple"></ion-spinner>',
                hideOnStageChange: true
            });
			var items=[];
			localDB.query('master/attendance', {
                "include_docs": true,"key":locationid + "_" + attendancedate
				}).then(function(result) {
				console.log("results of attendance records got - ");
				console.log(result);
                for (var k in result.rows) {
					console.log("prajakta");
					console.log(result.rows[k].doc);
                    items.push(result.rows[k].doc);
                }
                console.log(items);
                def.resolve(items);
				$ionicLoading.hide();
            },function(err){
				console.log(err);
				$ionicLoading.hide();
			})
			return def.promise;
		},
		getreportrecords: function(locationid,attendancedate){
			console.log("location id and date of getreportrecords ");
			console.log(locationid,attendancedate);
			console.log("include_docs key for getreportrecords");
			console.log(locationid +"_"+ attendancedate);
			var def = $q.defer();
            $ionicLoading.show({
                template: '<ion-spinner class ="spinner-energized" icon="ripple"></ion-spinner>',
                hideOnStageChange: true
            });
			var items=[];
			localDB.query('master/attendance', {
                "include_docs": true,"key":locationid+"_"+attendancedate
				}).then(function(result) {
				console.log("results of Todays report records got - ");
				console.log(result);
                for (var k in result.rows) {
					result.rows[k].doc.present=(result.rows[k].doc.present==true?"Present":"Absent");
                    items.push(result.rows[k].doc);
                }
                console.log(items);
                def.resolve(items);
				$ionicLoading.hide();
            },function(err){
				console.log(err);
				$ionicLoading.hide();
			})
			return def.promise;
		},
		/* getreportrecords: function(){
			console.log("location id and date of getreportrecords ");
			//console.log(locationid);
			console.log("include_docs key for getreportrecords");
			//console.log("key:", locationid);
			var def = $q.defer();
            $ionicLoading.show({
                template: '<ion-spinner class ="spinner-energized" icon="ripple"></ion-spinner>',
                hideOnStageChange: true
            });
			var items=[];
			localDB.query('master/attendance', {
				   "include_docs": true
              //  "include_docs": true
				}).then(function(result) {
				console.log("results of Todays report records got - ");
				console.log(result);
                for (var k in result.rows) {
                    items.push(result.rows[k].doc);
                }
                console.log(items);
                def.resolve(items);
				$ionicLoading.hide();
            },function(err){
				console.log(err);
				$ionicLoading.hide();
			})
			return def.promise;
		}, */
		getlocations: function(){
			var def = $q.defer();
            $ionicLoading.show({
                template: '<ion-spinner class ="spinner-energized" icon="ripple"></ion-spinner>',
                hideOnStageChange: true
            });
			var items=[];
			localDB.query('master/location', {
                "include_docs": true
				}).then(function(result) {
				console.log("results got - ");
				console.log(result);
                for (var k in result.rows) {
                    items.push(result.rows[k].doc);
                }
                console.log(items);
                def.resolve(items);
				$ionicLoading.hide();
            },function(err){
				console.log(err);
				$ionicLoading.hide();
			})
			return def.promise;
		},
		getgroupid: function(locationid){
			console.log("key:",locationid);
			
			var def = $q.defer();
            $ionicLoading.show({
                template: '<ion-spinner class ="spinner-energized" icon="ripple"></ion-spinner>',
                hideOnStageChange: true
            });
			var items=[];
			localDB.query('master/farmergrouplocation_by_locationid', {
                "include_docs": true,"key":locationid
				}).then(function(result) {
				console.log("results got - ");
				console.log(result);
                for (var k in result.rows) {
                    items.push(result.rows[k].doc);
                }
                console.log(items);
                def.resolve(items);
				$ionicLoading.hide();
            },function(err){
				console.log(err);
				$ionicLoading.hide();
			})
			return def.promise;
		},
		getgroup: function(groupid){
			var def = $q.defer();
            $ionicLoading.show({
                template: '<ion-spinner class ="spinner-energized" icon="ripple"></ion-spinner>',
                hideOnStageChange: true
            });
			var items=[];
			localDB.query('master/group_by_groupid', {
                "include_docs": true,"key":groupid
				}).then(function(result) {
				console.log("results got - ");
				console.log(result);
                for (var k in result.rows) {
					result.rows[k].doc.present=false;
                    items.push(result.rows[k].doc);
                }
                console.log(items);
                def.resolve(items);
				$ionicLoading.hide();
            },function(err){
				console.log(err);
				$ionicLoading.hide();
			})
			return def.promise;
		},
		getgroups: function(groups){
			var def = $q.defer();
            $ionicLoading.show({
                template: '<ion-spinner class ="spinner-energized" icon="ripple"></ion-spinner>',
                hideOnStageChange: true
            });
			var items=[];
			localDB.query('master/group_by_groupid', {
                "include_docs": true,"keys":groups
				}).then(function(result) {
				console.log("results got - ");
				console.log(result);
                for (var k in result.rows) {
					result.rows[k].doc.present=false;
                    items.push(result.rows[k].doc);
                }
                console.log(items);
                def.resolve(items);
				$ionicLoading.hide();
            },function(err){
				console.log(err);
				$ionicLoading.hide();
			})
			return def.promise;
		},
		insertattendance: function(attendance){
			var def = $q.defer();
            $ionicLoading.show({
                template: '<ion-spinner class ="spinner-energized" icon="ripple"></ion-spinner>',
                hideOnStageChange: true
            });
			var items=[];
			localDB.bulkDocs(attendance).then(function(result) {
				def.resolve('ok');
                
				$ionicLoading.hide();
            },function(err){
				console.log(err);
				$ionicLoading.hide();
			})
			return def.promise;
		},
		gettimetablerecords: function(){
			var def = $q.defer();
            $ionicLoading.show({
                template: '<ion-spinner class ="spinner-energized" icon="ripple"></ion-spinner>',
                hideOnStageChange: true
            });
			var timeitems=[];
			localDB.query('master/timetable', {
                "include_docs": true
				}).then(function(result) {
				console.log("results of timetable got - ");
				console.log(result);
                for (var k in result.rows) {
                    timeitems.push(result.rows[k].doc);
                }
                console.log(timeitems);
                def.resolve(timeitems);
				$ionicLoading.hide();
            },function(err){
				console.log(err);
				$ionicLoading.hide();
			})
			return def.promise;
		}
    }
})