define(function(require, exports) {
    var
        $           = require("jquery"),
        mootools    = require("mootools");

    (function (exports) {
        exports.TestController = new Class({

            initialize: function(container, testCase, method)
            {
                this.container = container;
                this.testCase = testCase;
                this.method = method;
            },

            assertEquals: function(expected, actual)
            {
                if (expected !== actual) {
                    this.container.append(this.method.toString() + ': ');
                    this.container.append(expected + '!==' + actual);
                    this.container.append('<br>');
                }
            },

            end: function()
            {
                if (typeof this.testCase.tearDown !== 'undefined')
                    this.testCase.tearDown();
            },

            run: function()
            {
                (function()
                {
                    if (typeof this.testCase.setUp !== 'undefined')
                        this.testCase.setUp();
                    try
                    {
                        this.testCase[this.method](this);
                    }
                    catch(e)
                    {
                        //alert(e);
                        this.container.append(this.method.toString() + ': ');
                        this.container.append('Exception ' + e.name + ': ' + e.message);
                        this.container.append('<br>');
                    }
                }).delay(0, this);
            }
        });

        exports.TestRunner = new Class({
            initialize: function(container, testcases)
            {
                this.container = container;
                this.testcases = testcases;

                this.container.addClass("jsunit-container");
            },

            _runTest: function(testCaseClass)
            {
                var self = this;

                for(var x in testCaseClass.prototype)
                {
                    if (x.toString().substr(0, 4) == 'test')
                    {
                        (function()
                        {
                            var testCase = new testCaseClass();
                            var testCaseContainer = $("<div></div>");
                            self.container.append(testCaseContainer)
                            var testController = new exports.TestController(testCaseContainer, testCase, x);
                            testController.run();
                        })();
                    }
                }
            },

            run: function()
            {
                for(var i = 0; i < this.testcases.length; i++)
                {
                    this._runTest(this.testcases[i]);
                }
            }
        });

    })(exports);
});
