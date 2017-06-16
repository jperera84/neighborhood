var AppViewModel = function () {
    var self = this;
    self.mapElement = document.getElementById('map');
    self.filterText = document.getElementById('search_field');
    self.filterButton = document.getElementById('btFilter');
    self.mapObj = map;
    self.locations = ko.observableArray([
        {id: 1, title: 'Holywood Theater', location: {lat: 43.098344, lng: -76.145697}},
        {id: 2, title: 'Mattydale Fire Department', location: {lat: 43.098172, lng: -76.142189}},
        {id: 3, title: 'Original Italian Pizza', location: {lat: 43.098854, lng:  -76.144700}},
        {id: 4, title: 'Roxboro Road Middle School', location: {lat: 43.101110, lng: -76.150901}},
        {id: 5, title: 'Big Lots', location: {lat: 43.101400, lng: -76.146985}},
        {id: 6, title: 'Camnel pub', location: {lat: 43.098670, lng: -76.145832}}
    ]);
    self.markers=[];
    self.textFilter = ko.observable();
    self.filterLocations = ko.computed(function () {
                    return ko.utils.arrayFilter(self.locations(), function (loc) {
                        if(self.textFilter() === undefined || self.textFilter() === ""){
                            for (var i = 0; i < self.markers.length; i++) {
                                self.markers[i].setMap(map);
                            }
                            return true;
                        }
                        self.hideMarkers();
                        return loc.title.toLowerCase().includes(self.textFilter().toLowerCase());
                    });
                }, this);
    
    self.LoadMarkers = function() {       
        for (var i = 0; i < self.locations().length; i++) {
            var location = self.locations()[i];
            var marker = new google.maps.Marker({
                position: location.location,
                map: map,
                title: location.title,
                animation: google.maps.Animation.DROP,
                id: location.id,
            });
            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png'),

            self.markers.push(marker);
            self.ListenersForMarkers(marker);
        }
    };

    self.ListenersForMarkers = function(marker){
         var largeInfowindow = new google.maps.InfoWindow();
         
         marker.addListener('click', function() {
                self.populateInfoWindow(this, largeInfowindow);
        });
        marker.addListener('mouseover', function() {
            this.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
        });
        marker.addListener('mouseout', function() {
            this.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
        });
    };

    self.LoadMarkers();

    self.populateInfoWindow = function(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            var geocoder = new google.maps.Geocoder();
            var latlng = {lat: parseFloat(marker.position.lat()), lng: parseFloat(marker.position.lng())};
            var address = "";
            geocoder.geocode({'location': latlng}, function(results, status) {
                if (status === 'OK') {
                    if (results[1]) {
                        address = results[1].formatted_address;
                        infowindow.marker = marker;

                        $.ajax({
                            url: 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title,
                            dataType: 'jsonp',
                            success: function (data) {
                                var links = data[3];
                                var linkStr = "";
                                for (var i = 0; i < links.length; i++) {
                                    var linkAux = links[i];
                                    linkStr += '<li><a href=' + linkAux + '>' + linkAux + '</li>';
                                }
                                if(linkStr !== ""){
                                    infowindow.setContent('<div>' + marker.title + '</div><br><div>' + address + '</div><br><h5>Useful Links</h5><div><ul>' + linkStr + '</ul></div>');
                                }else{
                                    infowindow.setContent('<div>' + marker.title + '</div><br><div>' + address + '</div><br><h5>Useful Links</h5><div><ul><li>No useful links were found</i></ul></div>');
                                }
                                infowindow.open(map, marker);
                                // Make sure the marker property is cleared if the infowindow is closed.
                                infowindow.addListener('closeclick',function(){
                                    infowindow.setMarker = null;
                                });
                            },
                            error: function(){
                                infowindow.setContent('<div>' + marker.title + '</div><br><div>' + address + '</div>');
                                infowindow.open(map, marker);
                                // Make sure the marker property is cleared if the infowindow is closed.
                                infowindow.addListener('closeclick',function(){
                                    infowindow.setMarker = null;
                                });
                            }
                        });


                        
                    }else{
                        address = 'Cannot determine address at this location.';
                    }
                }else{
                    address = 'Cannot determine address at this location.';
                    infowindow.marker = marker;   
                    infowindow.setContent('<div>' + marker.title + '</div><br><div>' + address + '</div>');
                    infowindow.open(map, marker);
                    // Make sure the marker property is cleared if the infowindow is closed.
                    infowindow.addListener('closeclick',function(){
                        infowindow.setMarker = null;
                    });
                }
            });
            
        }
      };

    self.restrictMap = function(markIndex){
        // This function will loop through the listings and hide them all.
        var bounds = new google.maps.LatLngBounds();
        var largeInfowindow = new google.maps.InfoWindow();
        var marker = self.markers[markIndex - 1];
        bounds.extend(marker.position);
        map.fitBounds(bounds);
        self.populateInfoWindow(marker, largeInfowindow);
    };

    self.hideMarkers = function() {
        for (var i = 0; i < self.markers.length; i++) {
            var isIn = true;
            for (var y = 0; y < self.filterLocations().length; y++) {
                var el = self.filterLocations()[y];
                if(el.id !== i + 1 ){
                    isIn = false;
                }else{
                    isIn = true;
                    break;
                }
            }
            if(isIn){
                self.markers[i].setMap(map);
            }else{
                self.markers[i].setMap(null);
            }
        }
    };
};

ko.applyBindings(AppViewModel);