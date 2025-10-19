import React, { useState } from 'react';
import { Camera, Package, Upload, X, Search } from 'lucide-react';
import { barcodeAPI, fridgeAPI } from '../services/api';
import { auth } from '../services/firebase';

const AddItem = ({ onItemAdded }) => {
  const [showScanner, setShowScanner] = useState(false);
  //const [showBarcodeForm, setShowBarcodeForm] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [manualForm, setManualForm] = useState({
    name: '',
    type: 'other',
    expiration_date: '',
    barcode: '',
    nutritionfact: [],
    serving_count: '',
    serving_size: ''
  });

  const handleBarcodeScan = async (barcode) => {
    setLoading(true);
    if (!auth.currentUser) return;
    try {
      const response = await barcodeAPI.scanBarcode(barcode);
      const productData = response.data;
      console.log(productData);

      const food = productData.foods[0]

      // Add to fridge with product data

      setManualForm({
        name: food.description,
        type: food.foodCategory || 'other',
        expiration_date: '', //NEED TO PROVIDE PAGE TO ENTER EXPIRATION DATE
        barcode: barcode,
        nutritionfact: food.foodNutrients,
        serving_count: '', //ENTER IN NEXT PAGE
        serving_size: '' //ENTER IN NEXT PAGE
      });

      setShowScanner(false);
      setShowManualForm(true);
    } catch (error) {
      console.error('Error scanning barcode:', error);
      alert('Error scanning barcode. Please try again.');
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

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fridgeAPI.addItem(auth.currentUser.uid, manualForm);
      alert('Item added to fridge successfully!');
      setShowManualForm(false);
      setManualForm({
        name: '',
        type: 'other',
        expiration_date: '',
        barcode: '',
        nutritionfact: [],
        serving_count: '',
        serving_size: ''
      });
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Error adding item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Add Items to Your Fridge</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            className="button"
            onClick={() => setShowScanner(true)}
            disabled={loading}
          >
            <Camera style={{ marginRight: '0.5rem' }} />
            Scan Barcode
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
              <div style={{
                width: '100%',
                height: '200px',
                background: '#f0f0f0',
                border: '2px dashed #ccc',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '1rem 0'
              }}>
                <p>Barcode Scanner Placeholder</p>
              </div>
              <button
                className="button"
                onClick={() => handleBarcodeScan('00016000275287')}
                disabled={loading}
              >
                {loading ? 'Scanning...' : 'Simulate Scan'}
              </button>
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

              <p>Expiration Date</p>
              <input
                type="date"
                className="input"
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
                min="0"
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

const FileUpload = ({ onFileSelect, loading }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      className={`upload-area ${dragActive ? 'dragover' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <Upload size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
      <p>Drag and drop an image or video here</p>
      <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
        or click to select a file
      </p>
      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleChange}
        style={{ display: 'none' }}
        id="file-upload"
      />
      <label htmlFor="file-upload" style={{ cursor: 'pointer', marginTop: '1rem', display: 'inline-block' }}>
        <button className="button" disabled={loading}>
          {loading ? 'Processing...' : 'Choose File'}
        </button>
      </label>
    </div>
  );
};

export default AddItem;
