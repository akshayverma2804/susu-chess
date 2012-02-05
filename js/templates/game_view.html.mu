<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>{{white}} vs {{black}}</title>

    <link rel="stylesheet/less" type="text/css" href="/css/board_view.less" />
    <link rel="stylesheet/less" type="text/css" href="/css/game_view.less" />
    <link rel="stylesheet" href="/css/simplisite.css" />
    <script type="text/javascript" src="/js/libs/less-1.1.5.min.js"></script>
    <script type="text/javascript" src="/js/browser.config.js"></script>
    <script type="text/javascript">
        var gameJSON = {{{gameJSON}}};
    </script>

    <script type="text/javascript">
    require = {
        baseUrl: '/js',
        paths: libPaths()
    };

    </script>
    <script data-main="client/game_page.main" type="text/javascript" src="/js/libs/require.js"></script>
    <!--[if lt IE 9]><script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script><![endif]-->
</head>
<body>

<script type="text/html" id="games-with-same-pos-template">
     <tr>
         <td><span data-bind="{ text: white }"></span></td>
         <td><span data-bind="{ text: black }"></span></td>
         <td><a data-bind="attr: { href: '/game/' + id() + '#' + moveIndex() }">View game</a></td>
     </tr>
 </script>


<script type="text/html" id="chess-game-move-template">
    <span class="move-index" data-bind="text: moveIndex() + '.', visible: moveIndexVisible"></span>
    <a class="move-caption" href="#" data-bind="click: onClick"><span data-bind="text: caption"></span></a>
</script>

<script type="text/html" id="next-move-stat-item-template">
    <tr>
        <td><span data-bind="{ text: moveCaption }"></span></td>
        <td><span data-bind="{ text: whiteScore() + '%' }"></span></td>
        <td><span data-bind="{ text: blackScore() + '%' }"></span></td>
    </tr>
</script>

<script type="text/html" id="chess-game-template">
    <div class="col_33">
        <div class="board" style="width: 340px; height: 340px; position: relative;"></div>

        <div class="col_100" style="padding: 20px 0 0 20px">
            <div class="navigation-buttons">
                <button class="button to-begin" data-bind="click: gotoBegin">Begin</button>
                <button class="button prev-move" data-bind="click: gotoPrevMove">Prev</button>
                <button class="button next-move" data-bind="click: gotoNextMove">Next</button>
                <button class="button to-end" data-bind="click: gotoEnd">End</button>
            </div>
        </div>

    </div>

    <div class="col_66">
        <h3>Moves</h3>
        <div class="moves" >
            <p data-bind="template: { name: 'chess-game-move-template', foreach: moves }">

            </p>
        </div>

        <h3>Moves statistics</h3>
        <div class="next-move-stat">
           <table class="table">
               <thead>
                   <tr>
                       <th>Move</th>
                       <th>White score</th>
                       <th>Black score</th>
                   </tr>
               </thead>
               <tbody data-bind="{template : { name: 'next-move-stat-item-template', foreach: pageViewModel.gameViewModel().nextMoveStatItems } }">

               </tbody>
           </table>
        </div>
    </div>
    <div class="clearfix"></div>
</script>


<div class="container">

    <header class="header clearfix">
        <div class="logo">Chess Navigator</div>

        <nav class="menu_main">
            <ul>
                <li><a href="#">Find games</a></li>
                <li class="active"><a href="#">Analyze game</a></li>
            </ul>
        </nav>
    </header>

    <div class="info">
        <article class="hero clearfix">
            <div class="col_100">
            {{#game}}
                <h1><span>White: <strong>{{white}}</strong></span> - <span>Black: <strong>{{black}}</strong></span></h1>
                <p>Event: {{event}}; Game ID: {{id}}</p>
            {{/game}}
            </div>
        </article>

        <article class="article clearfix" data-bind="template: { name: 'chess-game-template', data: gameViewModel }">
        </article>

        <article class="article clearfix">
            <div class="col_33"><p></p>
            </div>
            <div class="col_66">
                <div class="games-with-same-pos">
                    <table class="scrollTable" cellspacing="0" cellpadding="0" border="0">

                        <thead class="fixedHeader">
                            <tr>
                                <th>White</th>
                                <th>Black</th>
                                <th></th>
                            </tr>
                        </thead>

                        <tbody class="scrollContent" data-bind="template: { name: 'games-with-same-pos-template', foreach: gameViewModel().samePositionGames }">
                        </tbody>

                    </table>
                </div>
            </div>
        </article>
    </div>

</div>


</body>
</html>