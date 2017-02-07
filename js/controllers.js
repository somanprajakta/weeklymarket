var baseurl;
angular.module('starter.controllers', ['ngCookies'])
    .controller('attendancecontroller', function($rootScope, $scope, $state, $ionicLoading, $http, $ionicHistory, $ionicTabsDelegate, $ionicPopup, $ionicPopover, Login, $cookies)
    {
        $scope.myGoBack = function()
        {
            $ionicHistory.goBack();
        };
        $scope.attendance = {};
        $scope.locationid = "";
        $scope.attendance.attendancedate = new Date();
        $scope.clear = function()
        {
            $scope.attendance = {};
            $scope.groups = [];
            $scope.attendance.attendancedate = new Date();
            Login.getlocations()
                .then(function(retval)
                {
                    $scope.attendance.locations = retval;
                    console.log($scope.attendance.locations);
                }, function() {});
        }
        $scope.insertattendance = function()
        {
            console.log($scope.groups);
            var doc = [];
            var ispresent = true;
            for (var j in $scope.groups)
            {
                var item = {};
                if ($scope.newrecord === false) item._id = $scope.groups[j]._id;
                if ($scope.newrecord === false) item._rev = $scope.groups[j]._rev;
                item.doctype = "attendance";
                item.groupid = $scope.groups[j].groupid;
                item.adminid = Login.getObject("username");
                item.locationid = $scope.locationid;
                var dt = new Date($scope.attendance.attendancedate)
                item.attendancedate = (dt.getMonth() + 1) + "/" + dt.getDate() + "/" + dt.getFullYear();
                ispresent = $scope.groups[j].present;
                //item.present = (ispresent == true ? "present" : "absent");
                item.present = $scope.groups[j].present;
                item.groupname = $scope.groups[j].groupname;
                doc.push(item);
            }
            console.log(doc);
            // Login.insertattendance(doc);
            if (doc.length > 0)
            {
                Login.insertattendance(doc)
                    .then(function(retval)
                    {
                        console.log(retval);
                        console.log(retval.length);
                        if (retval.length !== null)
                        {
                            alert("Records Updated Sucessfully");
                        }
                    }, function()
                    {
                        console.log("error");
                    });
            }
        }
        $scope.generateattendance = function()
        {
            $scope.groups = [];
            console.log($scope.attendance.attendancelocation);
            console.log($scope.attendance.attendancedate);
            //validations
            if ($scope.attendance.attendancelocation === undefined || $scope.attendance.attendancelocation === "")
            {
                $scope.attendance.attendancelocation = "";
                //$scope.attendance.attendancedate = "";
                alert("Enter Place");
                return;
            }
            if ($scope.attendance.attendancedate === undefined || $scope.attendance.attendancedate === "")
            {
                $scope.attendance.attendancedate = "";
                $scope.attendance.attendancelocation = "";
                alert("Enter Date");
                return;
            }
            var d = new Date();
            d.getDate();
            if ($scope.attendance.attendancedate > d)
            {
                alert("You cant select a future date");
                return;
            }
            for (var k in Object.keys($scope.attendance.locations))
            {
                console.log($scope.attendance.locations[k]);
                if ($scope.attendance.locations[k].name === $scope.attendance.attendancelocation)
                {
                    console.log($scope.attendance.locations[k].locationid);
                    $scope.locationid = $scope.attendance.locations[k].locationid;
                    break;
                }
            }
            var dt = new Date($scope.attendance.attendancedate)
            var str = (dt.getMonth() + 1) + "/" + dt.getDate() + "/" + dt.getFullYear();
            console.log($scope.locationid, str);
            $ionicLoading.show(
            {
                template: '<ion-spinner class ="spinner-energized" icon="ripple"></ion-spinner>',
                hideOnStageChange: true
            });
            Login.getattendancerecords($scope.locationid, str)
                .then(function(retval)
                {
                    console.log(retval.length);
                    //if no attendance records found insert 
                    if (retval.length === 0)
                    {
                        $scope.newrecord = true;
                        var grp = [];
                        Login.getgroupid($scope.locationid)
                            .then(function(retval)
                            {
                                console.log(retval);
                                var items = [];
                                for (var x in retval)
                                {
                                    items.push(retval[x].groupid);
                                }
                                Login.getgroups(items)
                                    .then(function(retval2)
                                    {
                                        console.log(retval2);
                                        $scope.groups = [];
                                        $scope.groups = (retval2);
                                        $ionicLoading.hide();
                                    })
                            })
                    }
                    else
                    {
                        var arr = [];
                        $scope.groups = [];
                        $scope.newrecord = false;
                        $scope.groups = retval;
                        $ionicLoading.hide();
                        //TODO: need to retrieve groupname from group id later on
                        /*for(var k in retval){
                        	Login.getgroup(retval[k].groupid).then(
                        		function (retval1) {
                        		console.log(retval1[0].groupname);
                        		console.log(k);
                        		retval[k].groupname = retval1[0].groupname;
                        		$scope.groups = retval;	
                        	})
                        }*/
                    }
                }, function()
                {
                    console.log("error");
                });
            //Object.keys($scope.attendance.locations).foreach()
        }
        Login.getlocations()
            .then(function(retval)
            {
                $scope.attendance.locations = retval;
                console.log($scope.attendance.locations);
            }, function() {});
        $ionicPopover.fromTemplateUrl('templates/popover.html',
            {
                scope: $scope,
            })
            .then(function(popover)
            {
                $scope.popover = popover;
            });
        $scope.openPopover = function($event)
        {
            //$scope.index = {'value' : index}; //i am using object, because simple variable shows binding problem some time
            //$scope.user = $scope.getuser();
            $scope.popover.show($event);
        };
        $scope.logout = function()
        {
            Login.setObject("username", "");
            Login.setObject("password", "");
            Login.setObject("loggedin", "");
            $scope.popover.hide();
            $scope.user = "";
            $ionicHistory.nextViewOptions(
            {
                disableBack: true
            });
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
            $state.go("signin");
        }
    })
    .controller('landingcontroller', function($rootScope, $scope, $state, $ionicLoading, $http, $ionicHistory, $ionicTabsDelegate, $ionicPopup, $ionicPopover, Login, $cookies)
    {
        $scope.myGoBack = function()
        {
            $ionicHistory.goBack();
        };
        $scope.gotopage = function(pagename)
        {
            $state.go(pagename);
        }
        $ionicPopover.fromTemplateUrl('templates/popover.html',
            {
                scope: $scope,
            })
            .then(function(popover)
            {
                $scope.popover = popover;
            });
        $scope.openPopover = function($event)
        {
            //$scope.index = {'value' : index}; //i am using object, because simple variable shows binding problem some time
            //$scope.user = $scope.getuser();
            $scope.popover.show($event);
        };
        $scope.logout = function()
        {
            Login.setObject("username", "");
            Login.setObject("password", "");
            Login.setObject("loggedin", "");
            $scope.popover.hide();
            $scope.user = "";
            $ionicHistory.nextViewOptions(
            {
                disableBack: true
            });
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
            $state.go("signin");
        }
    })
    .controller('SignInCtrl', function($rootScope, $scope, $state, $ionicLoading, $http, $ionicHistory, $ionicTabsDelegate, $ionicPopup, $ionicPopover, Login, $cookies)
    {
        $scope.myGoBack = function()
        {
            $ionicHistory.goBack();
        };
        $scope.login = function(username, password, url)
        {
            url = baseurl;
            console.log("Now logging in " + username + ":" + password + ":" + url);
            if (username === undefined || username === "")
            {
                $scope.username = "";
                $scope.password = "";
                alert("Enter User Name");
                return;
            }
            if (password === undefined || password === "")
            {
                $scope.username = "";
                $scope.password = "";
                alert("Enter Password");
                return;
            }
            $ionicHistory.nextViewOptions(
            {
                disableBack: true
            });
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
            $ionicLoading.show(
            {
                template: '<ion-spinner class ="spinner-energized" icon="ripple"></ion-spinner>',
                hideOnStageChange: true
            });
            Login.login(username, password, url)
                .then(function()
                {
                    console.log("Login Successful");
                    $scope.errmsg = "";
                    Login.setObject("username", username);
                    Login.setObject("password", password);
                    Login.setObject("loggedin", true);
                    Login.startsync(username);
                    $state.go("landing")
                }, function(err)
                {
                    console.log("Login Failed");
                    console.log(err);
                    $scope.errmsg = err;
                });
        }
    })
    .controller('aboutuscontroller', function($rootScope, $scope, $state, $ionicLoading, $http, $ionicHistory, $ionicTabsDelegate, $ionicPopup, $ionicPopover, Login, $cookies)
    {
        $scope.myGoBack = function()
        {
            $ionicHistory.goBack();
        };
        $ionicPopover.fromTemplateUrl('templates/popover.html',
            {
                scope: $scope,
            })
            .then(function(popover)
            {
                $scope.popover = popover;
            });
        $scope.openPopover = function($event)
        {
            //$scope.index = {'value' : index}; //i am using object, because simple variable shows binding problem some time
            //$scope.user = $scope.getuser();
            $scope.popover.show($event);
        };
        $scope.logout = function()
        {
            Login.setObject("username", "");
            Login.setObject("password", "");
            Login.setObject("loggedin", "");
            $scope.popover.hide();
            $scope.user = "";
            $ionicHistory.nextViewOptions(
            {
                disableBack: true
            });
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
            $state.go("signin");
        }
    })
    .controller('contactuscontroller', function($rootScope, $scope, $state, $ionicLoading, $http, $ionicHistory, $ionicTabsDelegate, $ionicPopup, $ionicPopover, Login, $cookies)
    {
        $scope.myGoBack = function()
        {
            $ionicHistory.goBack();
        };
        $ionicPopover.fromTemplateUrl('templates/popover.html',
            {
                scope: $scope,
            })
            .then(function(popover)
            {
                $scope.popover = popover;
            });
        $scope.openPopover = function($event)
        {
            //$scope.index = {'value' : index}; //i am using object, because simple variable shows binding problem some time
            //$scope.user = $scope.getuser();
            $scope.popover.show($event);
        };
        $scope.logout = function()
        {
            Login.setObject("username", "");
            Login.setObject("password", "");
            Login.setObject("loggedin", "");
            $scope.popover.hide();
            $scope.user = "";
            $ionicHistory.nextViewOptions(
            {
                disableBack: true
            });
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
            $state.go("signin");
        }
    })
    .controller('timetablecontroller', function($rootScope, $scope, $state, $ionicLoading, $http, $ionicHistory, $ionicTabsDelegate, $ionicPopup, $ionicPopover, Login, $cookies,$cordovaGeolocation)
    {
        var options = {timeout: 120000, enableHighAccuracy: true};
		var currcoord="";
		$scope.myGoBack = function()
        {
            $ionicHistory.goBack();
        };
        Login.gettimetablerecords()
            .then(function(retval)
            {
                $scope.timetable1 = retval;
                console.log(retval);
            }, function(err)
            {
                console.log("timetable record get Failed");
                console.log(err);
                $scope.errmsg = err;
            });
        $ionicPopover.fromTemplateUrl('templates/popover.html',
            {
                scope: $scope,
            })
            .then(function(popover)
            {
                $scope.popover = popover;
            });
        $scope.openPopover = function($event)
        {
            //$scope.index = {'value' : index}; //i am using object, because simple variable shows binding problem some time
            //$scope.user = $scope.getuser();
            $scope.popover.show($event);
        };
		$cordovaGeolocation.getCurrentPosition(options).then(function(position){
	   currcoord=position.coords.latitude+","+position.coords.longitude;
	}, function(error){
    console.log("Could not get location");
  });
  $scope.showMap=function(destcoord){
		
		
		var queryString="http://maps.google.com/maps?saddr=" +currcoord+"&daddr="+destcoord;
		console.log(queryString);
		window.open(queryString,"_system","location=yes");
	};
        $scope.logout = function()
        {
            Login.setObject("username", "");
            Login.setObject("password", "");
            Login.setObject("loggedin", "");
            $scope.popover.hide();
            $scope.user = "";
            $ionicHistory.nextViewOptions(
            {
                disableBack: true
            });
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
            $state.go("signin");
        }
    })
    .controller('reportLandingcontroller', function($rootScope, $scope, $state, $ionicLoading, $http, $ionicHistory, $ionicTabsDelegate, $ionicPopup, $ionicPopover, Login, $cookies)
    {
        $scope.myGoBack = function()
        {
            $ionicHistory.goBack();
        };
        $scope.gotopage = function(pagename)
        {
            $state.go(pagename);
        }
        $ionicPopover.fromTemplateUrl('templates/popover.html',
            {
                scope: $scope,
            })
            .then(function(popover)
            {
                $scope.popover = popover;
            });
        $scope.openPopover = function($event)
        {
            //$scope.index = {'value' : index}; //i am using object, because simple variable shows binding problem some time
            //$scope.user = $scope.getuser();
            $scope.popover.show($event);
        };
        $scope.logout = function()
        {
            Login.setObject("username", "");
            Login.setObject("password", "");
            Login.setObject("loggedin", "");
            $scope.popover.hide();
            $scope.user = "";
            $ionicHistory.nextViewOptions(
            {
                disableBack: true
            });
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
            $state.go("signin");
        }
    })
    .controller('pastReportscontroller', function($rootScope, $scope, $state, $ionicLoading, $http, $ionicHistory, $ionicTabsDelegate, $ionicPopup, $ionicPopover, Login, $cookies)
    {
        //$scope.attendance = {};
		
        $scope.locationid = "";
        $scope.todaysreport = {};
        $scope.myGoBack = function()
        {
            $ionicHistory.goBack();
        };
        $scope.clear = function()
        {
            $scope.locationid = {};
            $scope.todaysreport = {};
            Login.getlocations()
                .then(function(retval)
                {
                    $scope.todaysreport.reportloc = retval;
                    console.log($scope.todaysreport.reportloc);
                }, function() {});
        }
        $scope.getColorClass = function(status)
        {
            return (status === 'Present' ? "positive" : "assertive");
        };
        $scope.generateTodaysReport = function()
        {
            console.log($scope.todaysreport.loc);
            console.log($scope.todaysreport.date);
            //validations
            if ($scope.todaysreport.loc === undefined || $scope.todaysreport.loc === "")
            {
                $scope.todaysreport.loc = "";
                $scope.todaysreport.date = "";
                alert("Enter Place");
                return;
            }
            if ($scope.todaysreport.date === undefined || $scope.todaysreport.date === "")
            {
                $scope.todaysreport.date = "";
                $scope.todaysreport.loc = "";
                alert("Enter Date");
                return;
            }
            for (var k in Object.keys($scope.todaysreport.reportloc))
            {
                console.log($scope.todaysreport.reportloc[k]);
                if ($scope.todaysreport.reportloc[k].name === $scope.todaysreport.loc)
                {
                    console.log($scope.todaysreport.reportloc[k].locationid);
                    $scope.locationid = $scope.todaysreport.reportloc[k].locationid;
                    break;
                }
            }
            var dt = new Date($scope.todaysreport.date)
            var str = (dt.getMonth() + 1) + "/" + dt.getDate() + "/" + dt.getFullYear();
            console.log(str);
            console.log($scope.locationid, str);
            Login.getreportrecords($scope.locationid, str)
                .then(function(retval)
                {
                    $scope.records = retval;
                    console.log(retval);
                    console.log(retval.length);
                    if (retval.length === 0)
                    {
                        console.log("No Records Found");
						$scope.errmsg="No records found!"
                    }
                    else
                    {
                        $scope.records = retval;
						$scope.errmsg="";
                    }
                }, function(err)
                {
                    console.log("Failed to get the report!");
                    console.log(err);
                    $scope.errmsg = err;
                });
            //Object.keys($scope.attendance.locations).foreach()
        }
        Login.getlocations()
            .then(function(retval)
            {
                $scope.todaysreport.reportloc = retval;
                console.log($scope.todaysreport.reportloc);
            }, function() {});
        $ionicPopover.fromTemplateUrl('templates/popover.html',
            {
                scope: $scope,
            })
            .then(function(popover)
            {
                $scope.popover = popover;
            });
        $scope.openPopover = function($event)
        {
            //$scope.index = {'value' : index}; //i am using object, because simple variable shows binding problem some time
            //$scope.user = $scope.getuser();
            $scope.popover.show($event);
        };
        $scope.logout = function()
        {
            Login.setObject("username", "");
            Login.setObject("password", "");
            Login.setObject("loggedin", "");
            $scope.popover.hide();
            $scope.user = "";
            $ionicHistory.nextViewOptions(
            {
                disableBack: true
            });
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
            $state.go("signin");
        }
    })
    .controller('weeklyreportcontroller', function($rootScope, $scope, $state, $ionicLoading, $http, $ionicHistory, $ionicTabsDelegate, $ionicPopup, $ionicPopover, Login, $cookies)
    {
        $scope.myGoBack = function()
        {
            $ionicHistory.goBack();
        };
        $ionicPopover.fromTemplateUrl('templates/popover.html',
            {
                scope: $scope,
            })
            .then(function(popover)
            {
                $scope.popover = popover;
            });
        $scope.openPopover = function($event)
        {
            //$scope.index = {'value' : index}; //i am using object, because simple variable shows binding problem some time
            //$scope.user = $scope.getuser();
            $scope.popover.show($event);
        };
        $scope.logout = function()
        {
            Login.setObject("username", "");
            Login.setObject("password", "");
            Login.setObject("loggedin", "");
            $scope.popover.hide();
            $scope.user = "";
            $ionicHistory.nextViewOptions(
            {
                disableBack: true
            });
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
            $state.go("signin");
        }
    })
    .controller('gallery1controller', function($rootScope, $scope, $state, $ionicLoading, $http, $ionicHistory, $ionicTabsDelegate, $ionicPopup, $ionicPopover, Login, $cookies,$ionicSlideBoxDelegate)
    {
        $scope.myGoBack = function()
        {
            $ionicHistory.goBack();
        };
        
		$scope.images = ['img/gallery/1.jpg'
            ,'img/gallery/2.jpg'
        ,'img/gallery/3.jpg'
        ,'img/gallery/4.jpg'
       ];
		$scope.slideVisible = function(index)
		{
			if (index < $ionicSlideBoxDelegate.currentIndex() - 1 || index > $ionicSlideBoxDelegate.currentIndex() + 1)
			{
				return false;
			}
			return true;
		}
        $ionicPopover.fromTemplateUrl('templates/popover.html',
            {
                scope: $scope,
            })
            .then(function(popover)
            {
                $scope.popover = popover;
            });
        $scope.openPopover = function($event)
        {
            //$scope.index = {'value' : index}; //i am using object, because simple variable shows binding problem some time
            //$scope.user = $scope.getuser();
            $scope.popover.show($event);
        };
        $scope.logout = function()
        {
            Login.setObject("username", "");
            Login.setObject("password", "");
            Login.setObject("loggedin", "");
            $scope.popover.hide();
            $scope.user = "";
            $ionicHistory.nextViewOptions(
            {
                disableBack: true
            });
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
            $state.go("signin");
        }
		$scope.$on("$ionicSlides.sliderInitialized", function(event, data){
		  // data.slider is the instance of Swiper
		  $scope.slider = data.slider;
		});

		$scope.$on("$ionicSlides.slideChangeStart", function(event, data){
		  console.log('Slide change is beginning');
		});

		$scope.$on("$ionicSlides.slideChangeEnd", function(event, data){
		  // note: the indexes are 0-based
		  $scope.activeIndex = data.slider.activeIndex;
		  $scope.previousIndex = data.slider.previousIndex;
		});
		$scope.nextSlide = function() {
			$ionicSlideBoxDelegate.next();
		  }

    });