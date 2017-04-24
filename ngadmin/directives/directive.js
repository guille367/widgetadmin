angular.module('ngApp')

.directive('widgetAdmin',function(){
    return{
        link: function(scope,element,attrs){


            load(dFalopa,6,8,["#ECD078", "#D95B43", "#C02942", "#542437", "#53777A", "#c1dd53"],300);
        },
        templateUrl: 'views/widget.html',
    }
});

function load(data, vWidth,vFilas,pRango,vHeight){

    var custom_bubble_chart;    

    rubro = {
        Nombre: '',
        Id: 0,
        Items:[{}],
        Cantidad: 0,
    }

    var Rubros = [];

    data.forEach(function(item){

        let rubro = {};
        var q = Rubros.find((i) => { return i.Rubro == item.Rubro; });

        if(q){
            q.Items.push(item);
            q.Cantidad++;
        }
        else{
            rubro.Rubro = item.Rubro;
            rubro.Items = [];
            rubro.Items.push(item);
            rubro.Cantidad = 1;
            rubro.Id = Rubros.length;
            Rubros.push(rubro);
        }

    });

    //Ex finalidad2d REVISAR
    var rubros2d = []; // armo array 2d para ordenar
    for (var i = 0; i < Rubros.length; i++) {
        rubros2d[i] = {Id: Rubros[i].Id, Cantidad: Rubros[i].Cantidad};
    }

    rubros2d.sort(function(a, b) {
        return d3.descending(a[1], b[1]);
    })

    custom_bubble_chart = (function(d3, CustomTooltip) {
        "use strict";

        var width = 600,
            height = 600,
            tooltip = CustomTooltip("tooltip", 300),
            gravedad = -0.01,
            friction = 0.9,
            damper = 0.45,
            nodes = [],
            radioMinimo = 50,
            radioMaximo = 200,
            vis, force, circles, radius_scale;


        var center = {
            x: width / 2,
            y: height / 2
        };

        var centroides = {};
        for (var i = 0; i < Rubros.length; i++) {
            var r = Rubros[i];
            centroides[r.Id] = {
                id: r.Id,
                cantidad: r.Cantidad,
                x: (i + 1) * (width) / vWidth,
                y: height / 2
            }
        }
        
        var fill_color = d3.scale.ordinal()
            .domain(Rubros)
            .range(pRango);

        function custom_chart(data) {
            var max_amount = d3.max(data, function(d) {
                    return d.Cantidad;
                }),
                radius_scale = d3.scale.linear().domain([0, max_amount]).range([radioMinimo, radioMaximo]);
            
            //REVISAR 
            nodes = [];
            Rubros.forEach(function(d) {
                var node = {
                    Id: d.Id,
                    Rubro: d.Rubro,
                    radius: radius_scale(parseInt(d.Cantidad, 10)),
                    Cantidad: d.Cantidad,
                    Items: d.Items,
                    x: Math.random() * width,
                    y: Math.random() * height,
                };
                nodes.push(node);

            });

            nodes.sort(function(a, b) {
                return b.Cantidad - a.Cantidad;
            });

            vis = d3.select("#presupuesto-visualizado").append("svg")
                .attr("width", width)
                .attr("height", height);

            circles = vis.selectAll("circle")
                .data(nodes)
                .enter()
                .append("circle")
                .attr("r", 0)
                .style("opacity", 0.9)
                .attr("fill", function(d) {
                    return fill_color(d.Rubro); // REVISAR COLOR
                })
                .attr("stroke-width", 1.5)
                .attr("stroke", function(d) {
                    return d3.rgb(fill_color(d.Rubro)).darker(); // REVISAR COLOR
                })
                .attr("id", function(d) {
                    return "bubble_" + d.Id; // REVISAR
                })
                .on("click",function(d,i){
                    console.log(d,i)
                })
                .on("mouseover", function(d, i) {
                    var el = d3.select(this)
                    el.style("stroke-width", 3)
                    el.style("opacity", 0.9);
                    show_details(d, i, this);
                })
                .on("mouseout", function(d, i) {
                    hide_details(d, i, this);
                    var el = d3.select(this)
                    el.style("stroke-width", 1.5)
                        el.style("opacity", function (){
                            if ($('#jurisdiccion').hasClass('disabled')){
                                return 0.3;
                            }
                                return 0.9;
                            });
                });

            circles.transition().duration(1500).attr("r", function(d) {
                return d.radius;
            });

        }

        d3.selection.prototype.moveToFront = function() {
            return this.each(function() {
                this.parentNode.appendChild(this);
            });
        };

        function charge(d) {
            console.log(d.value)
            if (d.value < 0) {
                return 0
            } else {
                return -Math.pow(d.radius, 1.9)
            };
        }

        function start() {
            force = d3.layout.force()
                .nodes(nodes)
                .size([width, height]);
        }

        function show_details(data, i, element) {
            d3.select(element).attr("stroke", "black");
            var content = "<span>Finalidad:</span><span> " + "asdasdas" + "</span><br/>";
            content += "<span class=\"name\">Monto:</span><span class=\"value\"> $" + data.Cantidad + "</span>";
            tooltip.showTooltip(content, d3.event);
        }

        function moverAlCentro(alpha) {
                // Muevo objetos al centro
            return function(d) {
                d.x = d.x + (center.x - d.x) * (damper + 0.02) * alpha;
                d.y = d.y + (center.y - d.y) * (damper + 0.02) * alpha;
            };
        }

        function hide_details(data, i, element) {
            d3.select(element).attr("stroke", function(d) {
                return d3.rgb(fill_color(d.Rubro)).darker();
            });
            tooltip.hideTooltip();
        }

        var datosAdministrador = {};
        datosAdministrador.init = function(_data) {
            custom_chart(_data);
            start();
        };

        datosAdministrador.mostrar = function(){
            force.gravity(gravedad)
                .charge(charge)
                .friction(friction)
                .on("tick", function(e) {
                    circles.each(moverAlCentro(e.alpha))
                        .attr("fill", function(d) {
                            return fill_color(d.Rubro);
                        })
                        .attr("cx", function(d) {
                            return d.x;
                        })
                        .attr("cy", function(d) {
                            return d.y;
                        })
                        .style("opacity", 0.9);
                });
            force.start();
        }

        return datosAdministrador;
    })(d3, CustomTooltip);

    custom_bubble_chart.init(data);
    custom_bubble_chart.mostrar();
}

var dFalopa = [{
    Id: 1,
    Rubro: 'Mesas',
    Cantidad: 10,
    Descripcion: 'sillas0',
},{
    Id: 2,
    Rubro: 'Sillas',
    Cantidad: 51,
    Descripcion: 'sillas0',
},{
    Id: 3,
    Rubro: 'Maquinarias y equipos',
    Cantidad: 3,
    Descripcion: 'Maquinarias4',
},{
    Id: 4,
    Rubro: 'Equipo sanitario y de laboratorio',
    Cantidad: 7,
    Descripcion: '',
},{
    Id: 5,
    Rubro: 'Sillas',
    Cantidad: 199,
    Descripcion: 'sillas1',
},{
    Id: 6,
    Rubro: 'Herramientas',
    Cantidad: 280,
    Descripcion: 'Herramientas1',
},{
    Id: 7,
    Rubro: 'Herramientas',
    Cantidad: 44,
    Descripcion: 'Herramientas3',
},{
    Id: 8,
    Rubro: 'Herramientas',
    Cantidad: 3,
    Descripcion: 'Herramientas2',
},{
    Id: 9,
    Rubro: 'Maquinarias y equipos',
    Cantidad: 3,
    Descripcion: 'Maquinarias1',
},{
    Id: 10,
    Rubro: 'Maquinarias y equipos',
    Cantidad: 3,
    Descripcion: 'Maquinarias2',
},{
    Id: 11,
    Rubro: 'Maquinarias y equipos',
    Cantidad: 3,
    Descripcion: 'Maquinarias3',
}];

//ajax call
load(dFalopa,6,8,["#ECD078", "#D95B43", "#C02942", "#542437", "#53777A", "#c1dd53"],300);
//data, vertical width, vertical rows , arrColores ,vertical height