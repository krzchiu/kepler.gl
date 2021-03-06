// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import test from 'tape';
import {findDefaultLayer} from 'utils/layer-utils/layer-utils';

import {findPointFieldPairs} from 'utils/dataset-utils';
import {processCsvData} from 'processors/data-processor';
import {GEOJSON_FIELDS} from 'constants/default-settings';
import {KeplerGlLayers} from 'layers';
const {PointLayer, ArcLayer, GeojsonLayer, GridLayer, LineLayer} = KeplerGlLayers;

import {wktCsv} from 'test/fixtures/test-csv-data';
import {cmpLayers} from 'test/helpers/comparison-utils';

test('layerUtils -> findDefaultLayer.1', t => {
  const inputFields = [
    // layer 1
    {
      name: 'one_lat',
      tableFieldIndex: 1
    },
    {
      name: 'one_lng',
      tableFieldIndex: 2
    },
    // layer 2
    {
      name: 'two_two.lng',
      tableFieldIndex: 3
    },
    {
      name: 'two_two.lat',
      tableFieldIndex: 4
    },
    // layer 3
    {
      name: 'three longitude',
      tableFieldIndex: 5
    },
    {
      name: 'three latitude',
      tableFieldIndex: 6
    },
    // layer 4
    {
      name: 'four._.lon',
      tableFieldIndex: 7
    },
    {
      name: 'four._.lat',
      tableFieldIndex: 8
    },
    // layer 5
    {
      name: 'lat',
      tableFieldIndex: 9
    },
    {
      name: 'lon',
      tableFieldIndex: 10
    },
    // non layer
    //
    {
      name: 'non_layer_longitude.alt',
      tableFieldIndex: 11
    },
    {
      name: 'non_layer_latitude.alt',
      tableFieldIndex: 12
    }
  ];

  const dataId = 'testtest';

  const outputLayers = [
    new PointLayer({
      label: 'one',
      dataId,
      isVisible: true,
      columns: {
        lat: {
          value: 'one_lat',
          fieldIdx: 0
        },
        lng: {
          value: 'one_lng',
          fieldIdx: 1
        },
        altitude: {
          value: null,
          fieldIdx: -1,
          optional: true
        }
      }
    }),
    new PointLayer({
      label: 'two two',
      dataId,
      columns: {
        lat: {
          value: 'two_two.lat',
          fieldIdx: 3
        },
        lng: {
          value: 'two_two.lng',
          fieldIdx: 2
        },
        altitude: {
          value: null,
          fieldIdx: -1,
          optional: true
        }
      }
    }),
    new PointLayer({
      label: 'three',
      dataId,
      columns: {
        lat: {
          value: 'three latitude',
          fieldIdx: 5
        },
        lng: {
          value: 'three longitude',
          fieldIdx: 4
        },
        altitude: {
          value: null,
          fieldIdx: -1,
          optional: true
        }
      }
    }),
    new PointLayer({
      label: 'four',
      dataId,
      columns: {
        lat: {
          value: 'four._.lat',
          fieldIdx: 7
        },
        lng: {
          value: 'four._.lon',
          fieldIdx: 6
        },
        altitude: {
          value: null,
          fieldIdx: -1,
          optional: true
        }
      }
    }),
    new PointLayer({
      label: 'Point',
      dataId,
      columns: {
        lat: {
          value: 'lat',
          fieldIdx: 8
        },
        lng: {
          value: 'lon',
          fieldIdx: 9
        },
        altitude: {
          value: null,
          fieldIdx: -1,
          optional: true
        }
      }
    }),
    new ArcLayer({
      label: 'one -> two two arc',
      dataId,
      columns: {
        lat0: {
          value: 'one_lat',
          fieldIdx: 0
        },
        lng0: {
          value: 'one_lng',
          fieldIdx: 1
        },
        lat1: {
          value: 'two_two.lat',
          fieldIdx: 3
        },
        lng1: {
          value: 'two_two.lng',
          fieldIdx: 2
        }
      }
    }),
    new LineLayer({
      label: 'one -> two two line',
      dataId,
      columns: {
        lat0: {
          value: 'one_lat',
          fieldIdx: 0
        },
        lng0: {
          value: 'one_lng',
          fieldIdx: 1
        },
        lat1: {
          value: 'two_two.lat',
          fieldIdx: 3
        },
        lng1: {
          value: 'two_two.lng',
          fieldIdx: 2
        }
      }
    })
  ];

  const fieldPairs = findPointFieldPairs(inputFields);
  const layers = findDefaultLayer({fields: inputFields, fieldPairs, id: dataId}, KeplerGlLayers);

  t.equal(layers.length, outputLayers.length, 'number of layers found');

  layers.forEach((l, i) => cmpLayers(t, outputLayers[i], l));

  t.end();
});

test('layerUtils -> findDefaultLayer.2', t => {

  const inputFields = [
    // layer 1
    {
      name: 'all_points',
      tableFieldIndex: 1
    }
  ];
  const dataId = 'milkshake';
  const fieldPairs = findPointFieldPairs(inputFields);

  const dataset = {
    id: dataId,
    fields: inputFields,
    fieldPairs,
    label: 'sf_zip_geo'
  };

  const outputLayers = [
    new GeojsonLayer({
      label: 'sf_zip_geo',
      isVisible: true,
      dataId,
      columns: {
        geojson: {
          value: 'all_points',
          fieldIdx: 0
        }
      }
    })
  ];

  const layers = findDefaultLayer(dataset, KeplerGlLayers);

  t.equal(layers.length, 1, 'number of layers found');
  cmpLayers(t, outputLayers[0], layers[0]);

  t.end();
});

test('layerUtils -> findDefaultLayer.3', t => {
  const dataId = 'cool';

  const inputFields = [
    // layer 1 & 2
    {
      name: 'begintrip_lat',
      tableFieldIndex: 1
    },
    {
      name: 'begintrip_lng',
      tableFieldIndex: 2
    }
  ];

  const outputLayers = [
    new PointLayer({
      label: 'begintrip',
      dataId,
      isVisible: true,
      columns: {
        lat: {
          value: 'begintrip_lat',
          fieldIdx: 0
        },
        lng: {
          value: 'begintrip_lng',
          fieldIdx: 1
        },
        altitude: {
          value: null,
          fieldIdx: -1,
          optional: true
        }
      }
    })
  ];

  const fieldPairs = findPointFieldPairs(inputFields);
  const layers = findDefaultLayer({fields: inputFields, fieldPairs, id: dataId}, KeplerGlLayers);

  t.equal(layers.length, 1, 'number of layers found');
  layers.forEach((l, i) => cmpLayers(t, outputLayers[i], l));

  t.end();
});

test('layerUtils -> findDefaultLayer.4', t => {

  // Since all defaults layers are scanned and they
  // share field names or patterns.  This set produces
  // multiple layers.
  // Order determined by the order
  // the defaults are scanned inside the function under test.
  const inputFields = [
    // layer 1 (grid), 2 (arc), 3 (point)
    {
      name: 'begintrip_lat',
      tableFieldIndex: 1
    },
    {
      name: 'begintrip_lng',
      tableFieldIndex: 2
    },
    // layer 2 (arc), 4 (point)
    {
      name: 'dropoff_lat',
      tableFieldIndex: 3
    },
    {
      name: 'dropoff_lng',
      tableFieldIndex: 4
    }
  ];

  const dataId = 'yololo';
  const outputLayers = [
    new PointLayer({
      label: 'begintrip',
      dataId,
      isVisible: true,
      columns: {
        lat: {
          value: 'begintrip_lat',
          fieldIdx: 0
        },
        lng: {
          value: 'begintrip_lng',
          fieldIdx: 1
        },
        altitude: {
          value: null,
          fieldIdx: -1,
          optional: true
        }
      }
    }),
    new PointLayer({
      label: 'dropoff',
      dataId,
      columns: {
        lat: {
          value: 'dropoff_lat',
          fieldIdx: 2
        },
        lng: {
          value: 'dropoff_lng',
          fieldIdx: 3
        },
        altitude: {
          value: null,
          fieldIdx: -1,
          optional: true
        }
      }
    }),
    new ArcLayer({
      label: 'begintrip -> dropoff arc',
      dataId,
      columns: {
        lat0: {
          value: 'begintrip_lat',
          fieldIdx: 0
        },
        lng0: {
          value: 'begintrip_lng',
          fieldIdx: 1
        },
        lat1: {
          value: 'dropoff_lat',
          fieldIdx: 2
        },
        lng1: {
          value: 'dropoff_lng',
          fieldIdx: 3
        }
      }
    }),
    new LineLayer({
      label: 'begintrip -> dropoff line',
      dataId,
      columns: {
        lat0: {
          value: 'begintrip_lat',
          fieldIdx: 0
        },
        lng0: {
          value: 'begintrip_lng',
          fieldIdx: 1
        },
        lat1: {
          value: 'dropoff_lat',
          fieldIdx: 2
        },
        lng1: {
          value: 'dropoff_lng',
          fieldIdx: 3
        }
      }
    })
  ];

  const fieldPairs = findPointFieldPairs(inputFields);
  const layers = findDefaultLayer({fields: inputFields, fieldPairs, id: dataId}, KeplerGlLayers);

  t.equal(layers.length, outputLayers.length, 'number of layers found');
  layers.forEach((l, i) => cmpLayers(t, outputLayers[i], l));

  t.end();
});

test('layerUtils -> findDefaultLayer.5', t => {

  const inputFields = [
    // layer 1
    {
      name: 'one_late',
      tableFieldIndex: 1
    },
    {
      name: 'one_lng',
      tableFieldIndex: 2
    }
  ];

  const fieldPairs = findPointFieldPairs(inputFields);
  const layers = findDefaultLayer({fields: inputFields, fieldPairs, id: 'yo'}, KeplerGlLayers);

  t.equal(layers.length, 0, 'number of layers found');

  t.end();
});

test('layerUtils -> findDefaultLayer:GeojsonLayer', t => {
  const fields = [{
    name: 'random',
    tableFieldIndex: 1
  }, {
    name: 'begintrip_lng',
    tableFieldIndex: 2
  }, {
    name: 'cool',
    tableFieldIndex: 3
  }, {
    name: 'dropoff_lng',
    tableFieldIndex: 4
  }, {
    name: GEOJSON_FIELDS.geojson[0],
    tableFieldIndex: 5
  }, {
    name: GEOJSON_FIELDS.geojson[1],
    tableFieldIndex: 6
  }];

  const geojsonLayers = findDefaultLayer({
    fields,
    label: 'what',
    id: 'smoothie',
    fieldPairs: []
  }, KeplerGlLayers);

  const expectedGeojsonLayers = [
    new GeojsonLayer({
      label: 'what',
      dataId: 'smoothie',
      isVisible: true,
      columns: {
        geojson: {value: GEOJSON_FIELDS.geojson[0], fieldIdx: 4}
      }
    }),
    new GeojsonLayer({
      label: 'what',
      dataId: 'smoothie',
      isVisible: true,
      columns: {
        geojson: {value: GEOJSON_FIELDS.geojson[1], fieldIdx: 5}
      }
    })
  ];

  cmpLayers(t, expectedGeojsonLayers, geojsonLayers);
  t.end();
});

test('layerUtils -> findDefaultLayer:GeojsonLayer.wkt', t => {
  const {fields} = processCsvData(wktCsv);
  const dataId = '0dj3h';
  const label = 'some geometry file';

  const geojsonLayers = findDefaultLayer({fields, id: dataId, label, fieldPairs: []}, KeplerGlLayers);

  const expectedLayers = [
    new GeojsonLayer({
      dataId: '0dj3h',
      label: 'some geometry file',
      isVisible: true,
      columns: {
        geojson: {value: 'simplified_shape_v2', fieldIdx: 1}
      }
    }),
    new GeojsonLayer({
      dataId: '0dj3h',
      label: 'some geometry file',
      isVisible: true,
      columns: {
        geojson: {value: 'simplified_shape', fieldIdx: 2}
      }
    })
  ];

  cmpLayers(t, expectedLayers, geojsonLayers);
  t.end();
});

test('layerUtils -> findDefaultLayer:IconLayer', t => {

  const inputFields = [{
    name: 'begintrip_lat',
    tableFieldIndex: 1
  }, {
    name: 'begintrip_lng',
    tableFieldIndex: 2
  }, {
    name: 'dropoff_lat',
    tableFieldIndex: 3
  }, {
    name: 'dropoff_lng',
    tableFieldIndex: 4
  }];
  const fieldPairs = findPointFieldPairs(inputFields);

  const eventIcon = [{name: 'event_icon', tableFieldIndex: 5}];
  const nameIcon = [{name: 'name.icon', tableFieldIndex: 5}];

  t.equal(findDefaultLayer({
      fields: inputFields,
      fieldPairs,
      id: 'meow'}, KeplerGlLayers
    ).filter(l => l.type === 'icon').length, 0,
    'should find no icon layer');

  const fieldsWithIcon = [...inputFields, ...eventIcon];
  const fieldPairsWIcon = findPointFieldPairs(fieldsWithIcon);

  let iconLayers = findDefaultLayer({
    fields: fieldsWithIcon,
    fieldPairs: fieldPairsWIcon,
    id: 'meow'}, KeplerGlLayers
  ).filter(l => l.type === 'icon');

  t.equal(iconLayers.length, 1, 'should find 1 icon layer');
  t.equal(iconLayers[0].config.label, 'event icon', 'should find 1 icon layer');

  const fieldsWith2Icon = [...inputFields, ...nameIcon, ...eventIcon];
  const fieldPairsW2Icon = findPointFieldPairs(fieldsWith2Icon);

  iconLayers = findDefaultLayer({
    fields: fieldsWith2Icon,
    fieldPairs: fieldPairsW2Icon,
    id: 'meow'}, KeplerGlLayers
  ).filter(l => l.type === 'icon');

  t.equal(iconLayers.length, 2, 'should find 2 icon layers');
  t.equal(iconLayers[0].config.label, 'name icon', 'should find 2 icon layer');

  t.end();
});
