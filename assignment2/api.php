<?php

header("Cache-Control: no-cache, must-revalidate");
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, POST');

/** creating an abstract class which holds all the responses codes. */
abstract class HTTPResponseCode {
    const OK = 200;
    const RECORD_CREATED = 201;
    const NO_CONTENT = 204;
    const BAD_REQUEST = 400;
    const METHOD_NOT_ALLOWED = 405;
    const INTERNAL_SERVER_ERROR = 500;  
}

class MyApi {
    /** the active connection to the database */
    private $conn = null;
    
    /**
     * @param string $host the ip address that you want to connect to 
     * @param string $dbname the database name you want to connect to 
     * @param string $username the username of the user you to connect with
     * @param string $password the password of the user you to connect with
     */
    public function __construct(string $host, string $dbname, string $username, string $password) {
        try {
            $this->conn = new PDO('mysql:host=' . $host . ';dbname=' . $dbname, $username, $password);
        } catch (PDOException $e) {
            $this->set_response_code(HTTPResponseCode::INTERNAL_SERVER_ERROR);
        }
    }

    /** 
     * Sets the HTTP response code
     * @param int $statusCode the status code you want to set the response to 
     */
    public function set_response_code(int $statusCode) {
        http_response_code($statusCode);
    }

    /** 
     * Gets the comments for the current object id
     * @param string $object_id the object id passed through either GET or POST 
     * @return array
    */
    private function get_comments_for_object_id(string $object_id)  : array {
        $sql = "SELECT `name`,`comment` FROM `comments` WHERE `objectId` = ?";
        $stmt = $this->execute_sql_statement($sql, array($object_id));
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Inserts a comment into the database
     * @param string $object_id the object id passed through either GET or POST
     * @param string $name the name you want to insert into the database
     * @param string $comment the comment you want to add to the message
     */
    private function insert_comment(string $object_id, string $name, string $comment) {
        $sql = "INSERT INTO `comments` (`objectId`,`name`,`comment`) VALUES(?,?,?)";
        $this->execute_sql_statement($sql, array($object_id, $name, $comment));
    }

    /**
     * Executes the SQL statement on the server
     * @param string $sql the SQL statement you want to execute on the server
     * @param array $data the data you want to append to the SQL statement, defaults to blank array (not required).
     * @return PDOStatement
     */
    private function execute_sql_statement(string $sql, array $data = array()) : PDOStatement {
        $conn = $this->conn;
        $stmt = $conn->prepare($sql, $data);
        $stmt->execute($data);
        return $stmt;
    }

    /**
     * Sets the HTTP Response Code and writes the data to the screen.
     * @param int $statusCode the HTTP Response Code you want to set
     * @param array $data the Data you want to write to the screen.
     */
    private function write_data(int $statusCode, array $data) {
        $this->set_response_code($statusCode);
        echo json_encode($data);
    }

    /**
     * Handles the GET request 
     * @param string $object_id the current object id
     */
    private function handle_get_request(string $object_id) {
        $results = $this->get_comments_for_object_id($object_id);
        
        // setting the response code to no content, if there are no results or the results haven't been set.
        if(!isset($results) || count($results) == 0) {
            $this->set_response_code(HTTPResponseCode::NO_CONTENT);
        } else {
            // precompiling the data to write to the screen.
            $data = array(
                'oid' => $object_id,
                'comments' => $results
            );
            $this->write_data(HTTPResponseCode::OK, $data);   
        }
    }

    /**
     * Handles the POST request
     * @param string $object_id the current object id
     */
    private function handle_post_request(string $object_id) {
        $name = $_POST['name'];
        $comment = $_POST['comment'];
        $conn = $this->conn;

        // if the name is between 0 and 64 and if the comment's length is zero. We have a bad request.
        if((strlen($name) == 0 || strlen($name) > 64) || strlen($comment) == 0) {
            $this->set_response_code(HTTPResponseCode::BAD_REQUEST);
        } else {
            // inserts the comment into the database and then writes the current lastInsertedId to the screen.
            $this->insert_comment($object_id, $name, $comment);
            
            $data = array(
                'id' => $conn->lastInsertId()
            );

            $this->write_data(HTTPResponseCode::RECORD_CREATED, $data);
        }
    }

    /**
     * A public function which handles the requests, which calls the get and post methods.
     */
    public function handle_request() {
        $object_id = $_GET['oid'] ?: $_POST['oid'];
        $object_id = trim($object_id);

        // if the object id isn't set, or doesn't meet the regex or doesn't meet the required length.
        if(!isset($object_id) || !preg_match("/[0-9a-zA-Z]/", $object_id) || !(strlen($object_id) > 0 && strlen($object_id) <= 32)) {
            $this->set_response_code(HTTPResponseCode::BAD_REQUEST);
        } else {

            $request_method = $_SERVER['REQUEST_METHOD'];

            switch($request_method) {
                case 'GET':
                    $this->handle_get_request($object_id);
                    break;
                case 'POST':
                    $this->handle_post_request($object_id);
                    break;
                default:
                    $this->set_response_code(HTTPResponseCode::BAD_REQUEST);
                    break;
            }
        }
    }

    /** setting the connection to null when we're done with the object. */
    public function __destruct()
    {
        $this->conn = null;
    }
}

$api = new MyApi(
    "INSERT_DATABASE_HOST", // host
    "INSERT_DATABASE_NAME", // database_name
    "INSERT_USERNAME", // username
    "INSERT_PASSWORD" // password
);

$api->handle_request();
