import React, { useState } from 'react';
import { Camera, Package, X, Search, ArrowBigRight, Leaf, Apple, Egg, Milk } from 'lucide-react';
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

export default AddItem;
