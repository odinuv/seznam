<?php

$v = urldecode(trim($_SERVER['REQUEST_URI'], '/'));

echo "<h1>" . $v . "</h1>";
