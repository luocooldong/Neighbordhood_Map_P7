function initApp() { // 初始化函数
    (function($) { // 即时函数      

        // Google地图初始化
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 14,
            center: { lat: 39.9042, lng: 116.407396 } // 地理城市坐标设置为北京
        });
        // 显示详情窗口
        var infoWindow = new google.maps.InfoWindow();

        // 默认位置，硬编码
        var model = [{
            name: 'Temple of Heaven',
            position: {
                lat: 39.883704,
                lng: 116.41284
            }
        }, {
            name: 'Grand View Garden',
            position: {
                lat: 39.868008,
                lng: 116.355644
            }
        }, {
            name: 'Guomao',
            position: {
                lat: 39.909962,
                lng: 116.45924
            }
        }, {
            name: 'CCTV Headquarters',
            position: {
                lat: 39.915275,
                lng: 116.464231
            }
        }, {
            name: 'Tiananmen',
            position: {
                lat: 39.90549,
                lng: 116.397632
            }
        }, {
            name: 'The Palace Museum',
            position: {
                lat: 39.916345,
                lng: 116.397155
            }
        }, {
            name: 'Cultural Palace of Nationalites',
            position: {
                lat: 39.908209,
                lng: 116.369134
            }
        }];

        // 标记图表的默认颜色
        var defaultIcon = makeMarkerIcon('0091ff');

        // 高亮的地图背景颜色
        var highlightedIcon = makeMarkerIcon('FFFF24');

        // 构造函数  
        function Location(location) {
            this.name = location.name;
            this.location = location;
            this.active = ko.observable(true);
            this.setMarker();
        }

        // 构造函数的原型对象
        Location.prototype = {
            constructor: Location,        // 设置原型对象的constructor为Loaction，因为重写了原型对象，所以会对原来默认的设置造成破坏
            setMarker: function() {       // 在地图上为每一个地点设置标记
                // 提前保存当前作用域，方便后面使用
                var self = this;
                self.marker = new google.maps.Marker({
                    position: self.location.position, 
                    map: map,
                    title: self.name,
                    animation: google.maps.Animation.DROP,
                    icon: defaultIcon
                });

                self.visible = ko.computed(function() {
                    return self.marker.setVisible(self.active());
                });

                self.marker.addListener('click', function() {
                    self.activateMarker();
                });

                // 当鼠标移动到坐标标记上时，更改背景颜色
                self.marker.addListener('mouseover', function() {
                    self.marker.setIcon(highlightedIcon);
                });
                // 当鼠标移动从坐标标记移开时，更改背景颜色
                self.marker.addListener('mouseout', function() {
                    self.marker.setIcon(defaultIcon);
                });

                self.loadData();
            },
            activateMarker: function() {   //显示地点详情
                var self = this;

                map.panTo(self.marker.getPosition());

                infoWindow.setContent(self.contentString);    //设置窗口标题

                infoWindow.open(map, self.marker);

                self.marker.setAnimation(google.maps.Animation.BOUNCE);   //自适应地图外围边界

                setTimeout(function() {                                   //如果请求时间超时，代表该地点暂时不可用
                    self.marker.setAnimation(null)
                }, 1400);
            },
            loadData: function() {       //  加载第三方API    维基百科     
                var self = this;
                // load wikipedia data
                var wikiUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=
          ${self.name}&format=json&callback=wikiCallback`;
                //  设置异常处理
                var wikiRequestTimeout = setTimeout(function() {
                    alert('failed to get wikipedia resources while loading ${self.name} information from Wikipedia Api.');
                }, 8000);
                // Wikipedia AJAX reauest goes here
                $.ajax({
                    url: wikiUrl,
                    dataType: "jsonp",              // 数据传输格式     ，解决同源网络请求
                    jsonp: "callback"               // 默认可以不设置
                }).done(function(data) {            // 使用了jQuery的最新版本，进行回调数据处理
                    var info = data[2][0];
                    var url = data[3][0];
                    self.contentString = `<div id="content">
                                         <div id="siteNotice">
                                         </div>
                                         <h1 id="firstHeading" class="firstHeading">${self.name}</h1>
                                         <div id="bodyContent">
                                         <p> ${info} </p>
                                         </div>
                                         <a href="${url}"> ${url} </a>
                                         </div>`;     
                    clearTimeout(wikiRequestTimeout); //处理请求失败，若在一定时间内，成功获取到数据，那么就不会执行请求失败提示信息
                });
            }
        };

        var MapViewModel = function() {
            // 观察者模式
            this.activeNav = ko.observable(false);

            this.activateSidePanel = function() {
                this.activeNav(!this.activeNav())
            };
            this.locations = ko.observableArray([]);
            this.filter = ko.observable("");

            this.filterLocations = ko.computed(function() {
                var filter = this.filter().toLowerCase();
                // 如果只输入为空值，则会显示所有地点
                if (!filter) {
                    return [].map.call(this.locations(), function(item) {
                        return item.active(true);
                    });
                } else {
                    // 进行匹配查找
                    return [].filter.call(this.locations(), function(item) {
                        var found = item.location.name.toLowerCase()
                            .includes(filter);
                        item.active(found);
                        return found;
                    });
                }
            });
            // 当左侧列表中的某个值被选中时，该函数被调用
            this.activateCurrentMarker = function(marker) {
                marker.activateMarker()
            };
            // 数据加载，统一放到模型数组中
            model.forEach(function(location) {
                this.locations.push(new Location(location));
            })
        };

        $('#map').css('height', window.innerHeight - 35);
        ko.applyBindings(MapViewModel);
    })(jQuery); // 传入jQuery，为使里面在获取维基百科(第三方API)时，可以使用jQuery的AJAX请求，这样就不用自己再处理使用AJAX时会造成的浏览器差异
};


// 连接Google Maps出现错误时，被调用，给出提示信息
var mapApiError = function() {
    alert("An error occur trying to load Google Map, please make sure you have internet connection.");
};


// 根据传入的颜色，生成一种带有该颜色的地点图表   
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'https://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}
