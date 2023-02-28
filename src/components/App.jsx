import React, { Component } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { queryPixabayAPI } from './servises/PixabayAPI';
import GlobalStyles from './theme/GlobalStyles';
import SearchBar from './Searchbar/SearchBar';
import Button from './Button/Button';
import ImageGallery from './ImageGallery/ImageGallery';
import { Oval } from 'react-loader-spinner';

class App extends Component {
  state = {
    query: '',
    page: 1,
    searchResult: [],
    total: 0,
    isLoading: false,
    error: false,
  };

  handleSubmit = inputValue => {
    if (inputValue === 0) {
      return;
    }
    const query = inputValue;
    const page = 1;
    this.setState({ query, page, searchResult: [] });
    this.fetchImages(query, page);
  };

  fetchImages = async (query, page) => {
    try {
      this.setState({ isLoading: true });
      const result = await queryPixabayAPI(query, page);

      if (result.hits.length === 0) {
        toast.error('No images found');
      }

      if (this.state.page === 1 && result.hits.length !== 0) {
        toast.success(`${result.total} images found`);
      }

      this.setState(prev => {
        return {
          query,
          page,
          searchResult: [...prev.searchResult, ...result.hits],
          total: result.total,
        };
      });
    } catch (error) {
      this.setState({ error: true });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  handleLoadMore = () => {
    this.setState(prevState => ({ page: prevState.page + 1 }));
  };

  componentDidUpdate(_, prevState) {
    if (prevState.page !== this.state.page) {
      const query = this.state.query;
      const page = this.state.page;
      this.fetchImages(query, page);
    }
  }

  checkPagesSum = page => {
    const pagesSum = this.state.total / 12;
    return page < pagesSum;
  };

  render() {
    return (
      <>
        <GlobalStyles />
        <SearchBar onSubmit={this.handleSubmit} />
        {this.state.isLoading === true && (
          <Oval
            ariaLabel="loading-indicator"
            height={150}
            width={150}
            strokeWidth={10}
            strokeWidthSecondary={1}
            color="blue"
            secondaryColor="white"
            wrapperClass="loader"
          />
        )}
        <ImageGallery searchResult={this.state.searchResult} />
        {this.state.query !== '' &&
          this.state.searchResult.length !== 0 &&
          this.state.isLoading !== true &&
          this.checkPagesSum(this.state.page) && (
            <Button handleLoadMore={this.handleLoadMore} />
          )}
        <ToastContainer />
      </>
    );
  }
}

export default App;
