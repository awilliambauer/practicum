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
    <script src="../expressions/expressions.js"></script>
    <meta charset="UTF-8">
</head>
<body>
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

<div id="consent-form-modal" class="modal fade">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>

                <h2 class="page-header">Data usage consent form</h2>
            </div>

            <div class="modal-body">
                <h4>
                    UNIVERSITY OF WASHINGTON

                </h4>
                <h4>
                    CONSENT FORM
                </h4>
                <p>
                    Usability and Effectiveness of Educational Tools
                    for Introductory Computer Science Courses
                </p>

                <h4>
                    Researchers
                </h4>
                <p>
                <ul>
                    <li>Eleanor O’Rourke, Computer Science & Engineering, eorourke@cs.washington.edu, 413-259-7352</li>
                    <li>Eric Butler, Computer Science & Engineering, edbutler@cs.washington.edu, 724-355-7904</li>
                    <li>Aaron Bauer, Computer Science & Engineering, awb@cs.washington.edu, 206-348-3268</li>
                </ul>
                </p>

                <h4>
                    Researchers’ Statement
                </h4>
                <p>
                    We are asking you to be in a research study.  The purpose of this consent form is to give you the information you will need to help you decide whether to be in the study or not.  Please read the form carefully.  You may ask questions about the purpose of the research, what we ask you to do, the possible risks and benefits, your rights as a volunteer, and anything else about the research or this form that is not clear.  When we have answered all your questions, you can decide if you want to be in the study or not.  This process is called “informed consent.”
                    The researchers listed above are available to answer questions about the study and may be contacted using the contact information above. Please note that we cannot ensure the confidentiality of information sent via email.
                </p>

                <h4>
                    PURPOSE OF THE STUDY
                </h4>
                <p>
                    The purpose of this study is to evaluate new educational tools designed to help students practice introductory computer science concepts. By studying how students like you interact with these tools, ware able to improve the design of the educational content and develop improved techniques for supporting student learning. Note that it is not you who is being tested in this study, but the educational tools themselves. You may use the tool as you would any other materials provided in a course.
                </p>

                <h4>
                    STUDY PROCEDURES
                </h4>
                <p>
                    At the beginning of the quarter, you will be asked to complete a survey about your interest in computer science as a major and career. During the study, you may be asked to use an online educational resource as a supplement to materials that are being presented in class. When you access the educational resource for each new concept, a brief pre-assessment will be given to determine your experience with the concept. One week after you are given access to the educational resource, you will be asked to complete a brief post-assessment. Both tests consist of three practice problems relating to a computer science concept you are studying in the course. Remember that we are not testing you, but rather testing the effectiveness of the educational tool.
                    Once we have given you the link to an educational resource for a given concept, you will be able to use that resource whenever you wish for the remainder of the course. The resources provide additional information about concepts and give you opportunities to practice solving problems on your own. You are not required to use the resource; you should treat it like any other supplemental material provided as part of a course.
                    After you use one the educational resource for a given concept, you may be asked to fill out a questionnaire about your experience using the resource. The questionnaire will ask about what you liked and disliked about the resource, and how you think it can be improved. We will not ask you any questions of a personally sensitive nature. At any time, you may refuse to answer any question or item on any test or questionnaire.
                    Throughout the study, we will record information about your usage of the educational resources. This includes data such as your progression through the exercises, the amount of time you spend on certain parts, and how much you seem to be learning. All the information we collect will be stored digitally. The data will be stored on password-protected machines. You will be assigned a unique identification code so that your data is not personally identifiable to researchers. Throughout the quarter, the course instructor will also provide us with anonymized exam scores. The instructor will never give the researchers any personally identifiable information, and all exam-related data will be stored on password-protected computers.
                </p>

                <h4>
                    RISKS, STRESS, OR DISCOMFORT
                </h4>
                <p>
                    Some people feel that providing information for research is an invasion of privacy. We will protect your privacy by assigning a unique identification code so that your data is not personally identifiable. Your course instructor will not know who is participating in the study, and your participation will have no impact on your grade in the computer science course.
                </p>

                <h4>
                    ALTERNATIVES TO TAKING PART IN THIS STUDY
                </h4>
                <p>
                    Participation in the research is voluntary. If you decide that you do not want to participate, you can indicate your wishes at the end of this page and we will not include your data in our research. Your data will only be used by your instructor. Your decision to participate in the study, or not participate, or withdraw from the study at a future time, will have no impact on your grade in your computer science course. You will still be allowed to use all of the provided resources during the course. The instructor will not know who is and is not participating in the study. Your individual privacy will be maintained in all published and written data resulting from the study. Should you change your mind after providing consent, please contact the researchers listed at the beginning of this form to rescind your consent.
                </p>

                <h4>
                    BENEFITS OF THE STUDY
                </h4>
                <p>
                    Improving learning in computer science courses has become increasingly important as interest in the field has increased and courses have grown. Exploring ways to increase and facilitate learning in traditional computer science courses through the use of online interactive tools will help educators achieve this goal. The findings of this study will facilitate the improvement of educational tools to support student understanding of computer science concepts. While we are currently studying the application of these tools to traditional computer science courses, these systems may have impact in online and distance learning scenarios as well. We are particularly interested in the potential for interactive educational tools to facilitate broader participation in computer science from currently underrepresented groups such as women and racial and ethnic minorities. This research has broad potential benefits for computer science students.
                </p>

                <h4>
                    OTHER INFORMATION
                </h4>
                <p>
                    Taking part in this study is voluntary.  You can stop at any time.  Choosing to take part in this study, to not take part, or to withdraw from this study will not affect benefits to which you are otherwise entitled. For example, your choice will not affect your academic standing or employment standing. Information about you is anonymous.  The information you give us is not linked to your name, and if any findings are published or presented, we will not use your name.
                </p>

                <h3>
                    Subject’s statement:
                </h3>
                <blockquote>
                    "This study has been explained to me.  I volunteer to take part in this research.  I have had a chance to ask questions.  If I have questions later about the research, I can ask one of the researchers listed above.  If I have questions about my rights as a research subject, I can call the UW Human Subjects Division at (206) 543-0098."
                </blockquote>



            </div>

            <div class="modal-footer">
                <span id="__consent-form-disagree-data" class="hidden"><?= json_encode($disagreeData); ?></span>
                <span id="__consent-form-agree-data" class="hidden"><?= json_encode($agreeData); ?></span>

                <button id="consent-form-disagree" href="#" class="btn btn-default pull-left" onclick="csed.sendConsentFormDisagree()" data-dismiss="modal">I Disagree</button>

                <label id="age-input-label" for="age-input">
                    Your age:
                </label>


                <input type="number" id="age-input" class="form-horizontal input-sm" />

                <button id="consent-form-agree" href="#" class="btn btn-primary" disabled="true" onclick="csed.sendConsentFormAgree()" data-dismiss="modal">I Agree</button>
            </div>
        </div>
    </div>

</div>
<script type="text/javascript" >
    $(document).ready(function() {
        csed.setProblemToLoad("expressions", "0e5f8705-13f6-4fbf-822b-54c803bee683");
    });
</script>
</body>
</html>



