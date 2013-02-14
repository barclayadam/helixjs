describe('Uri', function () {
    describe('Complex Full URI', function () {
        beforeEach(function () {
            this.input = 'http://domain:8080/path/to/file.html?key=value&arr=value2&arr=value3#myHashValue';
            this.uri = new hx.Uri(this.input);
        });

        it('should parse the scheme', function () {
            expect(this.uri.scheme).toEqual('http');
        });

        it('should parse the host', function () {
            expect(this.uri.host).toEqual('domain');
        });

        it('should parse the port', function () {
            expect(this.uri.port).toEqual(8080);
        });

        it('should parse the path', function () {
            expect(this.uri.path).toEqual('/path/to/file.html');
        });

        it('should parse the fragment', function () {
            expect(this.uri.fragment).toEqual('myHashValue');
        });

        it('should parse the query string', function () {
            expect(this.uri.query).toEqual('key=value&arr=value2&arr=value3');
        });

        it('should create variables from the query string', function () {
            expect(this.uri.variables['key']).toEqual('value');
            expect(this.uri.variables['arr'][0]).toEqual('value2');
            expect(this.uri.variables['arr'][1]).toEqual('value3');
        });

        it('should recreate via toString correctly', function () {
            expect(this.uri.toString()).toEqual(this.input);
        });
    });

    describe('URI with encoded characters in path', function () {
        describe('URI created with decode = true', function () {
            beforeEach(function () {
                this.input = 'http://domain:8080/path%20to/file.html';
                this.uri = new hx.Uri(this.input, {
                    decode: true
                });
            });

            it('should decode the path', function () {
                expect(this.uri.path).toEqual('/path to/file.html');
            });
        });

        describe('URI created with decode = false', function () {
            beforeEach(function () {
                this.input = 'http://domain:8080/path%20to/file.html';
                this.uri = new hx.Uri(this.input, {
                    decode: false
                });
            });

            it('should not decode the path', function () {
                expect(this.uri.path).toEqual('/path%20to/file.html');
            });
        });
    });

    describe('Complex relative URI', function () {
        beforeEach(function () {
            this.input = '/path/to/file.html?key=value&key1=value2#myHashValue';
            this.uri = new hx.Uri(this.input);
        });

        it('should parse the path', function () {
            expect(this.uri.path).toEqual('/path/to/file.html');
        });

        it('should parse the fragment', function () {
            expect(this.uri.fragment).toEqual('myHashValue');
        });

        it('should parse the query string', function () {
            expect(this.uri.query).toEqual('key=value&key1=value2');
        });

        it('should create variables from the query string', function () {
            expect(this.uri.variables['key']).toEqual('value');
            expect(this.uri.variables['key1']).toEqual('value2');
        });

        it('should set the scheme to be falsy', function () {
            expect(this.uri.scheme).toBeFalsy();
        });

        it('should set the host to be falsy', function () {
            expect(this.uri.host).toBeFalsy();
        });

        it('should set the port to be falsy', function () {
            expect(this.uri.port).toBeFalsy();
        });

        it('should recreate via toString correctly', function () {
            expect(this.uri.toString()).toEqual(this.input);
        });
    });

    describe('Simple URI with no port, query or hash', function () {
        beforeEach(function () {
            this.input = 'http://domain/path/to/file.html';
            this.uri = new hx.Uri(this.input);
        });

        it('should parse the scheme', function () {
            expect(this.uri.scheme).toEqual('http');
        });

        it('should parse the host', function () {
            expect(this.uri.host).toEqual('domain');
        });

        it('should parse the path', function () {
            expect(this.uri.path).toEqual('/path/to/file.html');
        });

        it('should set fragment to be falsy', function () {
            expect(this.uri.fragment).toBeFalsy();
        });

        it('should set query to be falsy', function () {
            expect(this.uri.query).toBeFalsy();
        });

        it('should set variables to empty object', function () {
            expect(this.uri.variables).toEqual({});
        });

        it('should recreate via toString correctly', function () {
            expect(this.uri.toString()).toEqual(this.input);
        });
    });
    describe('round-tripping variables to query to variables', function () {
        beforeEach(function () {
            this.input = 'http://domain/path/to/file.html';

            this.uri = new hx.Uri(this.input);
            this.uri.variables['string'] = 'A String Value';
            this.uri.variables['int'] = 12345;
            this.uri.variables['bool'] = false;
            this.uri.variables['arr'] = ['A String Value', 123];

            this.generatedUri = new hx.Uri(this.uri.toString());
        });

        it('should handle strings', function () {
            expect(this.generatedUri.variables['string']).toEqual('A String Value');
        });

        it('should handle bools', function () {
            expect(this.generatedUri.variables['bool']).toEqual(false);
        });

        it('should handle numbers', function () {
            expect(this.generatedUri.variables['int']).toEqual(12345);
        });

        it('should handle arrays', function () {
            expect(this.generatedUri.variables['arr']).toEqual(['A String Value', 123]);
        });
    });

    describe('cloning a URI', function () {
        beforeEach(function () {
            this.input = 'http://domain:8080/path/to/file.html?key=value&arr=value2&arr=value3#myHashValue';
            this.original = new hx.Uri(this.input);
            this.clone = this.original.clone();
            this.clone.host = 'anotherDomain';
        });

        it('should have copies of all properties', function () {
            expect(this.clone.scheme).toEqual(this.original.scheme);
            expect(this.clone.port).toEqual(this.original.port);
            expect(this.clone.path).toEqual(this.original.path);
            expect(this.clone.fragment).toEqual(this.original.fragment);
            expect(this.clone.query).toEqual(this.original.query);
            expect(this.clone.variables).toEqual(this.original.variables);
        });
        
        it('should allow setting of properties without affecting original', function () {
            expect(this.original.host).toEqual('domain');
            expect(this.clone.host).toEqual('anotherDomain');
        });
    });
});