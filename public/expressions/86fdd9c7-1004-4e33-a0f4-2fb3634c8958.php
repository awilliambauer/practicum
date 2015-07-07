<?php
$userEmail = $_SERVER["eppn"];
$parts = explode("@", $userEmail);
$username = $parts[0];
if (!$username) {
    $username = "NOT_LOGGED_IN";
}

$version = 1;
$scheme = "uwnetid";

$studentData = [
    'username' => $username,
    'scheme' => $scheme,
    'version' => 1,
];

$agreeData = array_merge(['response' => 'agree'], $studentData);
$disagreeData = array_merge(['response' => 'disagree'], $studentData);

?>

<!DOCTYPE html>
<html>
<head lang="en">
    <title>Practice-That!</title>
    <link href="../images/squirtle.png" type="image/gif" rel="shortcut icon" />
    <!-- <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.0/css/bootstrap.min.css" rel= "stylesheet"> -->

    <!-- load common styles from bootstrap -->
    <link href="../css/bootstrap/bootstrap.min.css" type="text/css" rel="stylesheet" />

    <!-- load local files after to override bootstrap styling -->
    <link href="../common.css" type="text/css" rel="stylesheet" />
    <link href="../indexlayout.css" type="text/css" rel="stylesheet" />
    <link href="../css/csed.css" type="text/css" rel="stylesheet" />
    <link href="../expressions/bootstrap-expressions.css" type="text/css" rel="stylesheet" />

    <!-- load jQuery before cookie plugin, bootstrap, d3 -->
    <script src="../js/jquery/jquery-1.11.2.min.js"></script>

    <script src="../js/jquery/jquery.cookie.js"></script>
    <script src="../js/bootstrap/bootstrap.min.js"></script>
    <script src="../js/d3/d3.js"></script>
    <script src="../index.js"></script>
    <script src="../expressions/thoughtProcess.js"></script>
    <script src="../expressions/expressions.js"></script>
    <meta charset="UTF-8">
</head>
<body>
<script id="category-config" type="text/javascript">
    <?php
       include("../categoryConfig.json");
    ?>
</script>

<!--
    <div class="topnavContainer topnavContainerScroll">
    </div>
-->
<nav class="navbar navbar-default navbar-csed">
    <div class="container-fluid">
        <a id="home-link" class="navbar-brand" href="#">
            <img alt="Home" src="../images/home-icon.png" />
        </a>

        <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">

            <!-- placeholder div for problems to be put into -->
            <ul id="problems-nav-container" class="nav navbar-nav">
            </ul>

            <ul class="nav navbar-nav navbar-right">
                <li class="dropdown">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"><span id="__username"><?= $username ?></span><span class="caret"></span></a>
                    <ul class="dropdown-menu">
                        <li><a href="#" data-toggle="modal" data-target="#consent-form-modal">Consent Form</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</nav>

<div id="__username" class="hidden"><?= $username ?></div>

<div id="main-page" class="container-fluid hidden">

    <div class="content">
        <div id="welcome">
            <h2>Welcome to Practice That!</h2>
            <p>
                On this site you can practice a wide variety of problems related to introductory programming
                through our in-depth learning environment. Click on a type of problem and let's get programming!
            </p>
        </div>
    </div>

    <!-- placeholder div for problem descriptions to be put into -->
    <div id="problems-content-container" class="container container-fluid"></div>
</div>

<!-- placeholder div for the problem content to go in -->
<div id="problem" class="container container-fluid hidden"></div>

<?php include("../consentFormModal.html"); ?>

<script type="text/javascript" >
    // Timing is important here. Set this value before document.ready, because
    // index.js renders the page onReady
    csed.setProblemToLoad("expressions", "86fdd9c7-1004-4e33-a0f4-2fb3634c8958");
</script>
</body>
</html>



