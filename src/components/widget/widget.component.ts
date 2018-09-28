/*
 * Copyright (C) 2015 The Gravitee team (http://gravitee.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as _ from 'lodash';

const WidgetComponent: ng.IComponentOptions = {
  template: require('./widget.html'),
  bindings: {
    widget: '<'
  },
  controller: function($scope, $state) {
    'ngInject';

    this.$state = $state;

    $scope.$on('gridster-resized', function () {
      $scope.$broadcast('onWidgetResize');
    });

    let that = this;

    $scope.$on('onTimeframeChange', function (event, timeframe) {
      // Associate the new timeframe to the chart request
      _.assignIn(that.widget.chart.request, {
        interval: timeframe.interval,
        from: timeframe.from,
        to: timeframe.to,
        query: that.$state.params['q']
      });

      that.reload();
    });

    $scope.$on('onQueryFilterChange', function (event, query) {
      // Associate the new query filter to the chart request
      _.assignIn(that.widget.chart.request, {
        query: query.query
      });

      // Reload only if not the same widget which applied the latest filter
      if (that.widget.$uid !== query.source) {
        that.reload();
      }
    });

    this.reload = function() {
      // Call the analytics service
      this.fetchData = true;

      let chart = this.widget.chart;

      // Prepare arguments
      let args = [this.widget.root, chart.request];

      if (! this.widget.root) {
        args.splice(0,1);
      }

      chart.service.function
        .apply(chart.service.caller, args)
        .then(response => {
          this.fetchData = false;
          this.results = response.data;
        });
    };
  }
};

export default WidgetComponent;
