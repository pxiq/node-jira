var http = require('http'),
    url = require('url'),
    request = require('request');


var JiraApi = exports.JiraApi = function(protocol, host, port, username, password, apiVersion) {
    this.protocol = protocol;
    this.host = host;
    this.port = port;
    this.username = username;
    this.password = password;
    this.apiVersion = apiVersion;

    this.cookies = [];
};

(function() {
    this.login = function(callback) {
        console.log("Attempting to log in to JIRA");

        var options = {
            uri: url.format({
                protocol:  this.protocol,
                host: this.host,
                port: this.port,
                pathname: 'rest/auth/1/session'
            }),
            method: 'POST',
            json: true,
            body: {
                'username': this.username,
                'password': this.password
            }
        };

        var self = this;
        request(options, function(error, response, body) {
            if (response.statusCode === 401) {
                callback('Failed to log in to JIRA due to authentication error.');
                return;
            }

            if (response.statusCode !== 200) {
                callback(response.statusCode + ': Unable to connect to JIRA during login.');
                return;
            }

            self.cookies = [];
            if (response.headers['set-cookie']) {
                self.cookies = response.headers['set-cookie'];
            }

            console.log("Logged in to JIRA successfully.");
            callback(null);
        });
    };

    this.findIssue = function(issueNumber, callback) {
        var self = this;
        this.login(function() {
            var options = {
                uri: url.format({
                    protocol: self.protocol,
                    host: self.host,
                    port: self.port,
                    pathname: 'rest/api/' + self.apiVersion + '/issue/' + issueNumber
                }),
                method: 'GET',
                headers: {
                    Cookie: self.cookies.join(';')
                }
            };
            request(options, function(error, response, body) {
                if (response.statusCode === 404) {
                    callback('Invalid issue number.');
                    return;
                }

                if (response.statusCode !== 200) {
                    callback(response.statusCode + ': Unable to connect to JIRA during findIssueStatus.');
                    return;
                }

                callback(null, JSON.parse(body));

            });
        });
    };

    this.getUnresolvedIssueCount = function(version, callback) {
        var self = this;
        this.login(function() {
            var options = {
                uri: url.format({
                    protocol: self.protocol,
                    host: self.host,
                    port: self.port,
                    pathname: 'rest/api/' + self.apiVersion + '/version/' + version + '/unresolvedIssueCount'
                }),
                method: 'GET',
                headers: {
                    Cookie: self.cookies.join(';')
                }
            };

            request(options, function(error, response, body) {
                if (response.statusCode === 404) {
                    callback('Invalid version.');
                    return;
                }

                if (response.statusCode !== 200) {
                    callback(response.statusCode + ': Unable to connect to JIRA during findIssueStatus.');
                    return;
                }

                body = JSON.parse(body);
                callback(null, body.issuesUnresolvedCount);
            });
        });
    };

    this.getProject = function(project, callback) {
        var self = this;
        this.login(function() {
            var options = {
                uri: url.format({
                    protocol: self.protocol,
                    host: self.host,
                    port: self.port,
                    pathname: 'rest/api/' + self.apiVersion + '/project/' + project
                }),
                method: 'GET',
                headers: {
                    Cookie: self.cookies.join(';')
                }
            };

            request(options, function(error, response, body) {
                if (response.statusCode === 404) {
                    callback('Invalid project.');
                    return;
                }

                if (response.statusCode !== 200) {
                    callback(response.statusCode + ': Unable to connect to JIRA during getProject.');
                    return;
                }

                body = JSON.parse(body);
                callback(null, body);
            });
        });
    };

    /**
     * Creates an issue link between two issues. Link should follow the below format:
     *
     * {
     *   'linkType': 'Duplicate',
     *   'fromIssueKey': 'HSP-1',
     *   'toIssueKey': 'MKY-1',
     *   'comment': {
     *     'body': 'Linked related issue!',
     *     'visibility': {
     *       'type': 'GROUP',
     *       'value': 'jira-users'
     *     }
     *   }
     * }
     *
     * @param link
     * @param errorCallback
     * @param successCallback
     */
    this.issueLink = function(link, callback) {
        var self = this;
        this.login(function() {
            var options = {
                uri: url.format({
                    protocol: self.protocol,
                    host: self.host,
                    port: self.port,
                    pathname: 'rest/api/' + self.apiVersion + '/issueLink'
                }),
                method: 'POST',
                headers: {
                    Cookie: self.cookies.join(';')
                },
                json: true,
                body: link
            };

            request(options, function(error, response, body) {
                if (response.statusCode === 404) {
                    callback('Invalid project.');
                    return;
                }

                if (response.statusCode !== 200) {
                    callback(response.statusCode + ': Unable to connect to JIRA during issueLink.');
                    return;
                }

                callback(null);
            });
        });
    };
     /**
     * Create a new Issue should look like the following:
     *
     * {
     *   "fields": {
     *      "project":
     *          { 
     *              "key": "TTP"
     *          },
     *      "summary": "testing creating an issue....",
     *      "description": "Fay P finally got it work wohoo",
     *      "issuetype": {
     *      "name": "Site Fix"
     *    }
     *  }
     * 
     *
     * @param data
     * @param errorCallback
     * @param successCallback
     */
    this.createIssue = function(data, callback){
        var self = this;
        this.login(function() {
            var options = {
                uri: url.format({
                    protocol: self.protocol,
                    host: self.host,
                    port: self.port,
                    pathname: 'rest/api/' + self.apiVersion + "/issue/TT-3"
                }),
                method: 'POST',
                headers: {
                    Cookie: self.cookies.join(';')
                },
                json: true,
                body: data
            };

        request(options, function(error, response, body) {
                if (response.statusCode === 404) {
                    callback('Invalid project.');
                    return;
                }

                if (response.statusCode !== 200) {
                    callback(response.statusCode + ': Unable to connect to JIRA during createIssue.');
                    return;
                }
                callback(null);
            });
        });
    };
    /**
     * Create a new Issue should look like the following:
     *
     * {
     *   "fields": {
     *      "project":
     *          { 
     *              "key": "TTP"
     *          },
     *      "summary": "testing creating an issue....",
     *      "description": "Fay P finally got it work wohoo",
     *      "issuetype": {
     *      "name": "Site Fix"
     *    }
     *  }
     * 
     *
     * @param data
     * @param issueKey
     * @param errorCallback
     * @param successCallback
     */
    this.updateIssue = function(issueKey, updateData, callback){
        var self = this;
        //Put back with changes
       this.login(function() {
            var options = {
                uri: url.format({
                    protocol: self.protocol,
                    host: self.host,
                    port: self.port,
                    pathname: 'rest/api/' + self.apiVersion + "/issue/" + issueKey
                }),
                method: 'PUT',
                headers: {
                    Cookie: self.cookies.join(';')
                },
                json: true,
                body: updateData
            };

        request(options, function(error, response, body) {
                if (response.statusCode === 404) {
                    callback('Invalid project.');
                    return;
                }

                if (response.statusCode !== 200) {
                    callback(response.statusCode + ': Unable to connect to JIRA during updateIssue.');
                    return;
                }
                callback(null);
            });
        }); 
    };

}).call(JiraApi.prototype);