import React, { useState } from 'react';
import { Camera, Package, Upload, X } from 'lucide-react';
import { barcodeAPI, fridgeAPI, uploadAPI } from '../services/api';
import { useAuth } from './AuthContext';

const AddItem = ({ onItemAdded }) => {
  const [showScanner, setShowScanner] = useState(false);
  //const [showBarcodeForm, setShowBarcodeForm] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const [manualForm, setManualForm] = useState({
    name: '',
    type: 'other',
    expirationDate: '',
    barcode: '',
    nutritionFacts: [],
    servingCount: '',
    servingSize: ''
  });

  const handleBarcodeScan = async (barcode) => {
    setLoading(true);
    if (!currentUser) return;
    try {
      const response = await barcodeAPI.scanBarcode(barcode);
      const productData = response.data;
      console.log(productData);

      const food = productData.foods[0]

      // Add to fridge with product data

      setManualForm({
        name: food.description,
        type: food.foodCategory || 'other',
        expirationDate: '', //NEED TO PROVIDE PAGE TO ENTER EXPIRATION DATE
        barcode: barcode,
        nutritionFacts: food.foodNutrients,
        servingCount: '', //ENTER IN NEXT PAGE
        servingSize: '' //ENTER IN NEXT PAGE
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

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fridgeAPI.addItem(manualForm);
      alert('Item added to fridge successfully!');
      setShowManualForm(false);
      setManualForm({
        name: '',
        type: 'other',
        expirationDate: '',
        barcode: '',
        nutritionFacts: [],
        servingCount: '',
        servingSize: ''
      });
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Error adding item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    setLoading(true);
    if (!currentUser) return;
    try {
      const response = await uploadAPI.uploadFile(file);
      const parsedItems = response.data.items;

      // Add parsed items to fridge
      for (const item of parsedItems) {
        await fridgeAPI.addItem(currentUser.uid, item);
      }

      alert(`Successfully added ${parsedItems.length} items to your fridge!`);
      setShowUpload(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error parsing image/video. Please try again.');
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
            onClick={() => setShowManualForm(true)}
            disabled={loading}
          >
            <Package style={{ marginRight: '0.5rem' }} />
            Add Manually
          </button>

          <button
            className="button secondary"
            onClick={() => setShowUpload(true)}
            disabled={loading}
          >
            <Upload style={{ marginRight: '0.5rem' }} />
            Upload Image/Video
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
                value={manualForm.expirationDate}
                onChange={(e) => setManualForm({...manualForm, expirationDate: e.target.value})}
                required
              />

              <input
                type="number"
                className="input"
                placeholder="Quantity"
                value={manualForm.servingCount}
                onChange={(e) => setManualForm({...manualForm, servingCount: parseInt(e.target.value)})}
                min="1"
                required
              />

              <input
                type="number"
                className="input"
                placeholder="Quantity Units"
                value={manualForm.servingSize}
                onChange={(e) => setManualForm({...manualForm, servingSize: parseInt(e.target.value)})}
                min="1"
                required
              />

              <button type="submit" className="button" disabled={loading}>
                {loading ? 'Adding...' : 'Add to Fridge'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {showUpload && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={() => setShowUpload(false)}>
              <X />
            </button>
            <h3>Upload Image/Video</h3>
            <FileUpload onFileSelect={handleFileUpload} loading={loading} />
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
