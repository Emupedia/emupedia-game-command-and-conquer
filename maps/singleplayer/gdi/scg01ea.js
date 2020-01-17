{
    "name":"scg01ea",
    "briefing": "Use the units provided to protect the Mobile Construction Vehicle (MCV).\nYou should then deploy the MCV by double clicking on it. Then you can\nbegin to build up a base. Start with a Power Plant. Finally, search out\nand destroy all enemy Nod units in the surrounding area.",

    "team":"gdi",
    "player":"GoodGuy",
    "cash" :{
        "GoodGuy":2000,
        "BadGuy":0
    },
    "videos" : {
      "briefing":"gdi/gdi1"
    },
    "height":24,
    "width":27,
    "y":3,
    "x":0,
    "theater":"temperate",
    "terrain":{
        "water":[
            [0,16],
            [0,17],[1,17],

            [0,18],[1,18],[2,18],[25,18],[26,18],

            [0,19],[1,19],[2,19],[3,19],[4,19],[5,19],[6,19],[7,19],[8,19],[9,19],[10,19],[11,19],[12,19],[13,19],[14,19],[15,19],[16,19],[17,19],[18,19],[19,19],[20,19],[21,19],[22,19],[23,19],[24,19],[25,19],[26,19],

            [0,20],[1,20],[2,20],[3,20],[4,20],[5,20],[6,20],[7,20],[8,20],[9,20],[10,20],[11,20],[12,20],[13,20],[14,20],[15,20],[16,20],[17,20],[18,20],[19,20],[20,20],[21,20],[22,20],[23,20],[24,20],[25,20],[26,20],
            [0,21],[1,21],[2,21],[3,21],[4,21],[5,21],[6,21],[7,21],[8,21],[9,21],[10,21],[11,21],[12,21],[13,21],[14,21],[15,21],[16,21],[17,21],[18,21],[19,21],[20,21],[21,21],[22,21],[23,21],[24,21],[25,21],[26,21],
            [0,22],[1,22],[2,22],[3,22],[4,22],[5,22],[6,22],[7,22],[8,22],[9,22],[10,22],[11,22],[12,22],[13,22],[14,22],[15,22],[16,22],[17,22],[18,22],[19,22],[20,22],[21,22],[22,22],[23,22],[24,22],[25,22],[26,22]
        ],
        "rocks":[
            [3,0],[3,1],
            [4,0],[4,1],[4,2],[4,3],
            [5,1],[5,2],[5,3],[5,4],[5,5],[5,7],
            [6,3],[6,4],[6,5],[6,6],[6,7],[6,8],[6,9],[6,10],[6,11],
            [7,7],[7,8],[7,9],[7,10],[7,11],[7,12],[7,13],
            [8,11],[8,12],[8,13],[8,14],[8,15],[8,16],
            [9,13],[9,14],[9,15],[9,16],
            [10,13],[10,14],[10,15],
            [11,13],[11,14],
            [12,13],[12,14],[12,15],
            [13,13],[13,14]
        ]
    },
    "requirements":{
        "infantry":["minigunner"],
        "ships":["gunboat","hovercraft"],
        "vehicles":["mcv","jeep","buggy"],
        "turrets":["gun-turret"],
        "buildings":["construction-yard","power-plant","barracks"],
        "walls":["sandbag"],
        "trees":["tree-01","tree-02","tree-05","tree-06","tree-07","tree-16","tree-17","tree-cluster-01","tree-cluster-02","tree-cluster-04","tree-cluster-05"]
    },
    "buildable":{
        "infantry":["minigunner"],
        "buildings":["power-plant","barracks"]
    },
    "starting":{
        "trees":[
            {"name":"tree-01","x":4,"y":12},
            {"name":"tree-01","x":9,"y":7},
            {"name":"tree-01","x":12,"y":7},
            {"name":"tree-06","x":22,"y":6},
            {"name":"tree-07","x":21,"y":6},
            {"name":"tree-07","x":14,"y":9},

            {"name":"tree-02","x":4,"y":9},
            {"name":"tree-02","x":6,"y":13},
            {"name":"tree-02","x":5,"y":15},

            {"name":"tree-05","x":10,"y":11},

            {"name":"tree-cluster-05","x":10,"y":1},
            {"name":"tree-cluster-05","x":21,"y":2},

            {"name":"tree-cluster-04","x":7,"y":4},
            {"name":"tree-cluster-04","x":23,"y":6},

            {"name":"tree-cluster-02","x":13,"y":0},
            {"name":"tree-cluster-02","x":20,"y":5},
            {"name":"tree-cluster-02","x":13,"y":8},
            {"name":"tree-cluster-02","x":9,"y":8},

            {"name":"tree-cluster-01","x":7,"y":2},
            {"name":"tree-cluster-01","x":11,"y":11},
            {"name":"tree-cluster-01","x":24,"y":0}


        ],
        "infantry":[
        {
           "player":"BadGuy",
           "team":"nod",
           "name":"minigunner",
           "y":0.5,
           "x":5.5,
           "orders":{
             "type":"hunt"
           },
           "direction":3
         },
         {
           "player":"BadGuy",
           "team":"nod",
           "name":"minigunner",
           "y":3,
           "x":14,
           "orders":{
             "type":"area guard"
           },
           "direction":3
         },
         {
           "player":"BadGuy",
           "team":"nod",
           "name":"minigunner",
           "y":4,
           "x":3,
           "orders":{
             "type":"guard"
           },
           "direction":4
         },
         {
           "player":"BadGuy",
           "team":"nod",
           "name":"minigunner",
           "y":4.5,
           "x":2.5,
           "orders":{
             "type":"guard"
           },
           "direction":4
         },
         {
           "player":"BadGuy",
           "team":"nod",
           "name":"minigunner",
           "y":8,
           "x":13,
           "orders":{
             "type":"area guard"
           },
           "direction":3
         },
         {
           "player":"BadGuy",
           "team":"nod",
           "name":"minigunner",
           "y":12,
           "x":11,
           "orders":{
             "type":"area guard"
           },
           "direction":3
         },
         {
           "player":"BadGuy",
           "team":"nod",
           "name":"minigunner",
           "y":6,
           "x":24,
           "orders":{
             "type":"area guard"
           },
           "direction":5
         },
         {
           "player":"BadGuy",
           "team":"nod",
           "name":"minigunner",
           "y":3,
           "x":13,
           "orders":{
             "type":"area guard"
           },
           "direction":3
         },
         {
           "player":"BadGuy",
           "team":"nod",
           "name":"minigunner",
           "y":3,
           "x":20,
           "orders":{
             "type":"area guard"
           },
           "direction":6
         },
         {
           "player":"BadGuy",
           "team":"nod",
           "name":"minigunner",
           "y":7,
           "x":21,
           "orders":{
             "type":"area guard"
           },
           "direction":5
         },





         {"name":"minigunner","team":"nod","player":"BadGuy","x":1,"y":2,"orders":{"type":"hunt"}},
         {"name":"minigunner","team":"nod","player":"BadGuy","x":2,"y":3,"orders":{"type":"hunt"}},
         {"name":"minigunner","team":"nod","player":"BadGuy","x":3,"y":2,"orders":{"type":"hunt"}},

        {"name":"minigunner","team":"gdi","player":"GoodGuy","x":20.75,"y":16,"direction":0,"orders":{"type":"guard"}},
        {"name":"minigunner","team":"gdi","player":"GoodGuy","x":20.75,"y":16.5,"direction":0,"orders":{"type":"guard"}},
        {"name":"minigunner","team":"gdi","player":"GoodGuy","x":21.25,"y":16,"direction":0,"orders":{"type":"guard"}},
        {"name":"minigunner","team":"gdi","player":"GoodGuy","x":21.25,"y":16.5,"direction":0,"orders":{"type":"guard"}}

            ],
        "buildings":[
        ],
        "turrets":[
            {"name":"gun-turret","team":"nod","player":"BadGuy","x":6,"percentLife":0.5,"y":16,"direction":16},
            {"name":"gun-turret","team":"nod","player":"BadGuy","x":11,"percentLife":0.5,"y":16,"direction":16},
            {"name":"gun-turret","team":"nod","player":"BadGuy","x":14,"percentLife":0.1875,"y":16,"direction":16}

            ],
        "walls":[
            {"name":"sandbag","team":"nod","player":"BadGuy","x":14,"y":15},
            {"name":"sandbag","team":"nod","player":"BadGuy","x":13,"y":15},
            {"name":"sandbag","team":"nod","player":"BadGuy","x":13,"y":16},
            {"name":"sandbag","team":"nod","player":"BadGuy","x":12,"y":16}
        ],
        "vehicles":[
            {"name":"mcv","team":"gdi","player":"GoodGuy","x":21,"y":14.75,"direction":0}
            ],

        "ships":[
            {"name":"gunboat","team":"gdi","player":"GoodGuy","x":18,"y":21,"turretDirection":4,"orders":{"type":"patrol","from":{"x":27,"y":21}, "to":{"x":-1,"y":21}}}
            ],


        "triggers":[
            {"name":"timed","time":3,"reinforcements":true,"action":"add","items":[
                {"name":"hovercraft","type":"ships","team":"gdi","player":"GoodGuy","x":19,"y":26,
                    "cargo":[
                        {"name":"minigunner","team":"gdi","player":"GoodGuy","type":"infantry"},
                        {"name":"minigunner","team":"gdi","player":"GoodGuy","type":"infantry"},
                        {"name":"minigunner","team":"gdi","player":"GoodGuy","type":"infantry"}
                    ],
                    "orders":{"type":"unload", "to":{"x":19,"y":18} ,"from":{"x":19,"y":24} }
                }]
            },
            {"name":"timed","time":6,"reinforcements":true,"action":"add","items":[
                {"name":"hovercraft","type":"ships","team":"gdi","player":"GoodGuy","x":19,"y":26,
                    "cargo":[
                        {"name":"minigunner","team":"gdi","player":"GoodGuy","type":"infantry"},
                        {"name":"minigunner","team":"gdi","player":"GoodGuy","type":"infantry"},
                        {"name":"minigunner","team":"gdi","player":"GoodGuy","type":"infantry"}
                    ],
                    "orders":{"type":"unload", "to":{"x":19,"y":18} ,"from":{"x":19,"y":24} }
                }]
            },
            {"name":"condition","condition":"(game.count(\"turrets\",\"BadGuy\")<1)", "action":"add",
                "items":[
                    {"name":"buggy","type":"vehicles","team":"nod","player":"BadGuy","x":18,"y":-1,"orders":{"type":"hunt"}}
                    ]
            },
            {"name":"condition","condition":"(game.count(\"turrets\",\"BadGuy\")==0 && game.count(\"vehicles\",\"BadGuy\")==0 && game.count(\"infantry\",\"BadGuy\") == 0)",
             "action":"success"},
            {"name":"condition","condition":"(game.count(\"buildings\",\"GoodGuy\")==0 && game.count(\"vehicles\",\"GoodGuy\")==0 && game.count(\"infantry\",\"GoodGuy\") == 0)",
             "action":"failure"},
            {"name":"timed","time":10,"reinforcements":true,"action":"add","items":
                [{"name":"hovercraft","type":"ships","team":"gdi","player":"GoodGuy","x":19,"y":26,
                    "cargo":[
                        {"name":"jeep","team":"gdi","player":"GoodGuy","type":"vehicles"}
                    ],
                    "orders":{"type":"unload", "to":{"x":19,"y":18} ,"from":{"x":19,"y":24} }
                }]
            },
            {"name":"timed","time":16,"reinforcements":true,"action":"add","items":
                [{"name":"hovercraft","type":"ships","team":"gdi","player":"GoodGuy","x":19,"y":26,
                    "cargo":[
                        {"name":"jeep","team":"gdi","player":"GoodGuy","type":"vehicles"}
                    ],
                    "orders":{"type":"unload", "to":{"x":19,"y":18} ,"from":{"x":19,"y":24} }
                }]
            }]
        }


}