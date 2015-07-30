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
    <meta charset="UTF-8">
    <title>Practicum</title>
    <link href="favicon.ico" type="image/x-icon" rel="shortcut icon"/>

    <!-- load common styles from bootstrap -->
    <link href="css/bootstrap/bootstrap.min.css" type="text/css" rel="stylesheet" />

    <!-- load local files after to override bootstrap styling -->
    <link href="css/indexlayout.css" type="text/css" rel="stylesheet" />
    <link href="css/csed.css" type="text/css" rel="stylesheet" />
    <link href="expressions/bootstrap-expressions.css" type="text/css" rel="stylesheet" />
    <link href="if_else/if_else.css" type="text/css" rel="stylesheet" />

    <!-- load jQuery before cookie plugin, bootstrap, d3 -->
    <script src="vendor/jquery/jquery-1.11.2.min.js"></script>

    <script src="vendor/jquery/jquery.cookie.js"></script>
    <script src="vendor/bootstrap/bootstrap.min.js"></script>
    <script src="vendor/d3/d3.js"></script>

    <!-- polyfill fetch for older browsers -->
    <script src="vendor/fetch/fetch.js"></script>
    <script src="vendor/papika.js"></script>

    <script src="js/logging.js"></script>

    <script src="js/java/ast.js"></script>
    <script src="js/java/parser.js"></script>

    <script src="js/tpl/main.js"></script>
    <script src="js/tpl/parser.js"></script>
    <script src="js/tpl/simulator.js"></script>
    <script src="js/tpl/explainer.js"></script>
    <script src="js/tpl/algorithms/expressionsHelper.js"></script>
    <script src="js/tpl/algorithms/ifElseHelper.js"></script>
    <script src="js/tpl/algorithms/arrayHelper.js"></script>

    <!-- load index before problem-specific JS -->
    <script src="js/index.js"></script>

    <script src="expressions/thoughtProcess.js"></script>
    <script src="expressions/expressions.js"></script>

    <script src="if_else/html_generator.js"></script>
    <script src="if_else/if_else.js"></script>

    <script src="array/array.js"></script>


</head>
<body>
    <script id="category-config" type="text/javascript">
        <?php
        include("include/categoryConfig.json");
        ?>
    </script>

    <nav class="navbar navbar-default navbar-csed">
        <div class="container-fluid">
            <a id="home-link" class="navbar-brand" href="#">
                <img alt="Home" src="images/home-icon.png" />
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

                <a href="https://catalyst.uw.edu/umail/form/aaronb22/4553" class="nav navbar-feedback navbar-right">Send Us Feedback</a>
            </div>
        </div>
    </nav>

    <div id="__username" class="hidden"><?= $username ?></div>

    <div id="main-page" class="container-fluid hidden">

        <div class="content">
            <div id="welcome">
                <h2>Welcome to Practicum!</h2>
                <p>
                    On this site you can practice a problems related to introductory<br>programming
                    through our in-depth learning environment.<br>Click on a type of problem and let's get programming!
                </p>
            </div>
        </div>

        <!-- placeholder div for problem descriptions to be put into -->
        <div id="problems-content-container" class="container container-fluid"></div>
    </div>

    <!-- placeholder div for the problem content to go in -->
    <div id="problem-container" class="container container-fluid hidden"></div>

    <?php include("include/consentFormModal.html"); ?>
</body>
</html>



