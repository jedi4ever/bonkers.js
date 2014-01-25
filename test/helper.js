var fogHelper = require('../lib/helper/fog');
var userDataHelper = require('../lib/helper/userData');

describe('helpers', function () {

  it('read a fog file', function(done) {
    var fogFile = __dirname + '/data/fogFile';
    var creds = fogHelper.readAwsCredentialsSync(fogFile, ':default');
    expect(creds).not.to.be(null);
    expect(creds.accessKeyId).to.be('TheId');
    expect(creds.accessKeySecret).to.be('TheKey');
    done();
  });

  it.only('generate the userdata file', function(done) {
    var config = {
      //userDataFile: __dirname + '/../templates/cloud-config.sh',
      dependencies: {
        'hiredis': '*'
      },
      scripts: {
        setup: '',
        cleanup: ''
      }
    };

    var userdata = userDataHelper.generate(config);
    expect(userdata).not.to.be(null);
    console.log(userdata);
    done();
  });

});
