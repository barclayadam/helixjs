describe('view model', function() {
  describe('subclassing viewModel', function() {
    beforeEach(function() {
      this.viewModel = hx.ViewModel.extend({
        nonObservable: 'My Non Observable Value',
        performSomeAction: this.spy()
      });

      this.viewModelInstance = new this.viewModel();
    });

    it('should set directly defined properties as properties of the view models prototype', function() {
      expect(this.viewModelInstance.nonObservable).toEqual('My Non Observable Value');
      expect(this.viewModel.prototype.nonObservable).toEqual('My Non Observable Value');
    });
  });
});
