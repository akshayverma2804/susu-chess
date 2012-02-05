<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>PGN files uploading</title>

    <link rel="stylesheet" href="/css/simplisite.css" />
    <link rel="stylesheet/less" type="text/css" href="/css/game_upload.less" />
    <link rel="stylesheet" type="text/css" href="/css/jquery-ui.css" />
    <script type="text/javascript" src="/js/libs/less-1.1.5.min.js"></script>
    <script type="text/javascript" src="/js/browser.config.js"></script>
    <script type="text/javascript">
    require = {
        baseUrl: '/js',
        paths: libPaths()
    };

    </script>
    <script data-main="client/game_uploading.main" type="text/javascript" src="/js/libs/require.js"></script>
    <!--[if lt IE 9]><script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script><![endif]-->
</head>
<body>

<div class="container">

    <header class="header clearfix">
        <div class="logo">Chess Navigator</div>

        <nav class="menu_main">
            <ul>
                <li><a href="#">Find games</a></li>
                <li><a href="/game/1">Analyze game</a></li>
                <li class="active"><a href="/upload">Upload PGN</a></li>
            </ul>
        </nav>
    </header>

    <div class="info">
        <article class="hero clearfix">
            <h1>Uploading PGN files</h1>
        </article>


        <article class="article clearfix">
            <div class="col_100">
                <h2>Drag-and-drop PGN file here. You can upload multiple files.</h2>
                <div class="pgn-drag-drop-zone">
                    <ul class="file-list">
                    </ul>
                </div>
            </div>
        </article>

        <article class="article clearfix">
            <div class="col_100 buttons">
                <button id="upload" class="button">Upload</button>
            </div>
        </article>

        <span id="percentage"></span>

    </div>

</div>


</body>
</html>