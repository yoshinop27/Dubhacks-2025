import React, { useState, useRef, useEffect } from 'react';
import { Camera, Package, X, Search, ArrowBigRight, Leaf, Apple, Egg, Milk, Square } from 'lucide-react';
import { barcodeAPI, fridgeAPI } from '../services/api';
import { BarcodeFormat } from '@zxing/browser';
import { BrowserMultiFormatReader, DecodeHintType } from '@zxing/library';
import { auth } from '../services/firebase';

const AddItem = ({ onItemAdded }) => {
  const [showScanner, setShowScanner] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState(null);
  //const [videoDevice, setVideoDevice] = useState(null);
  const [manualForm, setManualForm] = useState({
    name: '',
    type: 'vegetable',
    expiration_date: '',
    barcode: '',
    nutritionfact: [],
    serving_count: '',
    serving_size: ''
  });
  const codeReaderRef = React.createRef();

  // Scanner functions
  const startScanner = async () => {
    try {
      setScanning(true);

      const hints = new Map();
      const enabledFormats = [
        // ...ALL_FORMATS_WHICH_YOU_WANT_TO_ENABLE
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.UPC_EAN_EXTENSION
      ];
      hints.set(DecodeHintType.POSSIBLE_FORMATS, enabledFormats)

      const reader = new BrowserMultiFormatReader(hints);
      codeReaderRef.current = reader;
      await navigator.mediaDevices.getUserMedia({ video: {width:400}});
      const videoDevices = await reader.listVideoInputDevices();
      var videoDevice = videoDevices[0];

      reader.decodeFromVideoDevice(videoDevice.id, 'video', (result, error) => {
        if (result) {
          const barcode = result.getText();
          setScannedCode(barcode);
          handleBarcodeScan(barcode);
          stopScanner();
        }
        if (error && !error.message.includes('NotFoundException')) {
          console.error('Scanner error:', error);
        }
      });
    } catch (error) {
      console.error('Error starting scanner:', error);
      alert('Error accessing camera. Please check permissions.');
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    setScanning(false);
  };

  const handleBarcodeScan = async (barcode) => {
    setLoading(true);
    if (!auth.currentUser) return;
    try {
      const response = await barcodeAPI.scanBarcode(barcode);
      const productData = response.data;
      console.log(productData);

      const food = productData.foods[0]

      setManualForm({
        name: food.description,
        type: food.foodCategory || 'other',
        expiration_date: '',
        barcode: barcode,
        nutritionfact: food.foodNutrients,
        serving_count: '',
        serving_size: ''
      });

      setShowScanner(false);
      setShowManualForm(true);
    } catch (error) {
      console.error('Error selecting item', error);
      alert('Error selecting item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!auth.currentUser) return;
    try {
      const response = await barcodeAPI.search(searchValue);
      const productData = response.data;
      console.log(productData);
      setSearchResult(productData.foods);

      setShowSearch(false);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching:', error);
      alert('Error searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChooseItem = async (food) => {
    setLoading(true);
    if (!auth.currentUser) return;
    try {
      setManualForm({
        name: food.brandName + " " + food.description,
        type: food.foodCategory || 'other',
        expiration_date: '',
        barcode: food.gtinUpc,
        nutritionfact: food.foodNutrients,
        serving_count: '',
        serving_size: ''
      });

      setShowSearchResults(false);
      setSearchResult([]);
      setShowManualForm(true);
    } catch (error) {
      console.error('Error scanning barcode:', error);
      alert('Error scanning barcode. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup scanner when component unmounts or scanner closes
  useEffect(() => {
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, []);

  useEffect(() => {
    if (showScanner && !scanning) {
      startScanner();
    } else if (!showScanner && scanning) {
      stopScanner();
    }
  }, [showScanner]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fridgeAPI.addItem(auth.currentUser.uid, manualForm);
      alert('Item added to fridge successfully!');
      setShowManualForm(false);
      setManualForm({
        name: '',
        type: 'vegetable',
        expiration_date: '',
        barcode: '',
        nutritionfact: [],
        serving_count: '',
        serving_size: ''
      });
      if (onItemAdded) {
        onItemAdded();
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Error adding item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getItemIcon = (type = 'other') => {
    const iconProps = { size: 20 };
    switch (type?.toLowerCase()) {
      case 'vegetable':
        return <Leaf {...iconProps} />;
      case 'fruit':
        return <Apple {...iconProps} />;
      case 'protein':
        return <Egg {...iconProps} />;
      case 'dairy':
        return <Milk {...iconProps} />;
      default:
        return <Package {...iconProps} />;
    }
  };

  const getItemIconClass = (type = 'other') => {
    switch (type?.toLowerCase()) {
      case 'vegetable':
        return 'vegetable';
      case 'fruit':
        return 'fruit';
      case 'protein':
        return 'protein';
      case 'dairy':
        return 'dairy';
      default:
        return 'vegetable';
    }
  };

  return (
    <div>
      <div className="card">
        <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Add Items to Your Fridge</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
          <button
            className="button"
            onClick={() => setShowScanner(true)}
            disabled={loading}
            style={{
              minHeight: '30vh',
              fontSize: '1.2rem',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem'
            }}
          >
            <Camera size={48} />
            <span>Scan Barcode</span>
            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Point camera at barcode</span>
          </button>

          <button
            className="button secondary"
            onClick={() => setShowSearch(true)}
            disabled={loading}
          >
            <Search style={{ marginRight: '0.5rem' }} />
            Search
          </button>

          <button
            className="button secondary"
            onClick={() => setShowSearch(true)}
            disabled={loading}
          >
            <Search style={{ marginRight: '0.5rem' }} />
            Search
          </button>

          <button
            className="button secondary"
            onClick={() => setShowManualForm(true)}
            disabled={loading}
            style={{ padding: '1rem' }}
          >
            <Package style={{ marginRight: '0.5rem' }} />
            Add Manually
          </button>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={() => setShowScanner(false)}>
              <X />
            </button>
            <h3>Scan Barcode</h3>
            <div className="scanner-container">
              <p>Point your camera at a barcode to scan</p>
              <div className="video-container">
                <video
                  id="video"
                  //ref={videoRef}
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    height: '300px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    background: '#000'
                  }}
                  playsInline
                  muted
                />
                {scanning && (
                  <div className="scanner-overlay">
                    <div className="scanner-frame"></div>
                    <p className="scanner-text">Position barcode within the frame</p>
                  </div>
                )}
              </div>
              {scannedCode && (
                <div className="scanned-result">
                  <p>Scanned: {scannedCode}</p>
                </div>
              )}
              <div className="scanner-controls">
                <button
                  className="button secondary"
                  onClick={stopScanner}
                  disabled={!scanning}
                >
                  <Square size={16} />
                  Stop Scanner
                </button>
                <button
                  className="button"
                  onClick={startScanner}
                  disabled={scanning}
                >
                  <Camera size={16} />
                  Start Scanner
                </button>
              </div>

              {/* Manual Product Entry Fallback */}
              <div className="manual-entry-fallback">
                <p style={{ margin: '1rem 0', color: '#666', fontSize: '0.9rem' }}>
                  Camera not working? Add product manually:
                </p>
                <button
                  className="button"
                  onClick={() => {
                    setShowScanner(false);
                    setShowManualForm(true);
                  }}
                  style={{ width: '100%' }}
                >
                  <Package size={16} />
                  Add Product Manually
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Search Modal */}
      {showSearch && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={() => setShowSearch(false)}>
              <X />
            </button>
            <form onSubmit={handleSearch}>
              <input
              type="text"
              className="input"
              placeholder="search by name, type, etc."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              />
              <button type="submit" className="button" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Search Results Modal */}
      {showSearchResults && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={() => setShowSearchResults(false)}>
              <X />
            </button>

            {searchResult.map((item) => {
              return (
                <div key={item.fdcId} className="item-card">
                  <div className={`item-icon ${getItemIconClass(item.foodCategory)}`}>
                    {getItemIcon(item.foodCategory)}
                  </div>

                  <div className="item-details">
                    <div className="item-name">{item.brandName + " " + item.description}</div>
                    <div className="item-type" style={{
                      fontSize: '0.875rem',
                      color: '#666',
                      textTransform: 'capitalize',
                      marginBottom: '0.25rem'
                    }}>
                      {item.foodCategory}
                    </div>
                  </div>

                  <button
                    className="button"
                    onClick={() => handleChooseItem(item)}
                    style={{
                      padding: '0.5rem',
                      fontSize: '0.875rem',
                      minWidth: 'auto'
                    }}
                  >
                    <ArrowBigRight size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Manual Form Modal */}
      {showManualForm && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={() => setShowManualForm(false)}>
              <X />
            </button>
            <h3>Add Item</h3>
            <form onSubmit={handleManualSubmit}>
              <input
                type="text"
                className="input"
                placeholder="Item name"
                value={manualForm.name}
                onChange={(e) => setManualForm({...manualForm, name: e.target.value})}
                required
              />

              <input
                type="text"
                className="input"
                placeholder="Item type"
                value={manualForm.type}
                onChange={(e) => setManualForm({...manualForm, type: e.target.value})}
                required
              />

              <label htmlFor="expiration">Expiration Date</label>
              <input
                type="date"
                className="input"
                name="expiration"
                value={manualForm.expiration_date}
                onChange={(e) => setManualForm({...manualForm, expiration_date: e.target.value})}
                required
              />

              <input
                type="number"
                className="input"
                placeholder="Quantity"
                value={manualForm.serving_count}
                onChange={(e) => setManualForm({...manualForm, serving_count: parseInt(e.target.value)})}
                min="1"
                required
              />

              <input
                type="text"
                className="input"
                placeholder="Quantity Units"
                value={manualForm.serving_size}
                onChange={(e) => setManualForm({...manualForm, serving_size: e.target.value})}
                required
              />

              <button type="submit" className="button" disabled={loading}>
                {loading ? 'Adding...' : 'Add to Fridge'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AddItem;
