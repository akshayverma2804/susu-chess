<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Результаты поиска по запросу: {{queryString}}</title>
</head>
<body>

<div>Результаты поиска по запросу: {{queryString}}</div>
{{#games}}
    <div>
        <div>ID: {{id}}</div>
        <div>Event: {{event}}</div>
        <span>White: {{white}}</span>,
        <span>Black: {{black}}</span>
        <div><a href="game/{{id}}">ViewGame</a></div>
    </div>
    <br />
{{/games}}
</body>
</html>