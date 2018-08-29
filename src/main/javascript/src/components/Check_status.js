import React from "react";
import moment from 'moment';
import Helmet from 'react-helmet';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import { formatDate, parseDate } from "react-day-picker/moment";
import 'whatwg-fetch';
import ReactHTMLTable_ToExcel from "./ReactHTMLTable_ToExcel";
import Pagination from "react-js-pagination";

export class Check_status extends React.Component {

  constructor(props) {
    super(props);
    props = window.props;
    this.handleFromChange = this.handleFromChange.bind(this);
    this.handleToChange = this.handleToChange.bind(this);
    this.filterDateRange = this.filterDateRange.bind(this);
    this.searchInputChange = this.searchInputChange.bind(this);
    this.clearFilters = this.clearFilters.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleSubmitSuccess = this.handleSubmitSuccess.bind(this);
    this.handleSubmitFailure = this.handleSubmitFailure.bind(this);
    this.onToggleDropDown = this.onToggleDropDown.bind(this);
    this.state = {
      statuses: [],
      renderedUsers: [],
      renderedUsers1: [],
      searchValue: '',
      sortValue: null,
      from: undefined,
      to: undefined,
      activePage: 1,
      itemsCountPerPage: 5
    };
  }

  showFromMonth() {
    const { from, to } = this.state;
    if (!from) {
      return;
    }
    if (moment(to).diff(moment(from), 'months') < 2) {
      this.to.getDayPicker().showMonth(from);
    }
  }

  searchInputChange(event) {
    this.searchValue = event.target.value.toLowerCase();
    this.setState({ searchValue: this.searchValue });
    this.handlePageChange(1);
  }

  clearFilters() {
    document.getElementById("searchField").value = "";
    this.state.searchValue = '';
    const from = this.state.from = undefined;
    const to = this.state.to = undefined;
    this.filterDateRange(from, to);
  }

  focusTo() {
    this.timeout = setTimeout(() => this.to.getInput().focus(), 0);
  }

  handleFromChange(from) {
    this.setState({ from }, () => {
      if (!this.state.to) {
        this.focusTo();
      }
    });
    const to = this.state.to;
    this.filterDateRange(from, to);
  }

  handleToChange(to) {
    this.setState({ to }, this.showFromMonth);
    const from = this.state.from;
    this.filterDateRange(from, to);
  }

  filterDateRange(from, to) {
    if (from == undefined) {
      from = new Date("05/20/2018");
    }
    if (to == undefined) {
      to = new Date();
    }

    const currentLoggedinUsername = props.userName;
    const postData = {
      "username": currentLoggedinUsername,
      "startDate": from,
      "endDate": to
    };
    
    $.ajax({
      contentType: "application/json",
      type: "GET",
      url: "/expenses",
      data: postData,
      success: this.handleSubmitSuccess,
      error: this.handleSubmitFailure,
    });
  }
  handleSubmitSuccess(data) {
    this.setState({
      statuses: data
    });
    this.handlePageChange(1);
  }

  handleSubmitFailure(error) {
    console.log(error);
  }

  componentWillMount() {
    this.filterDateRange(undefined, undefined);
  }

  handlePageChange(pageNumber) {
    let numberOfRecords;
    if (document.getElementById("select") == null) {
      numberOfRecords = 5;
    }
    else {
      numberOfRecords = Number(document.getElementById("select").value);
    }
    const renderedUsers1 = this.state.renderedUsers.slice((pageNumber - 1) * numberOfRecords, (pageNumber - 1) * numberOfRecords + numberOfRecords);
    this.setState({ activePage: pageNumber, itemsCountPerPage: numberOfRecords, renderedUsers1 });
  }

  onToggleDropDown() {
    this.handlePageChange(1);
  }

  render() {
    const currentLoggedinUsername = props.userName;
    const { from, to } = this.state;
    const { renderedUsers1 } = this.state;
    const modifiers = { start: from, end: to };
    const dateFormat = require('dateformat');

    this.state.renderedUsers = this.state.statuses.filter(
      (p) => {
        if (this.state.searchValue) {
          return p.expenseName.toLowerCase().indexOf(this.state.searchValue) !== -1 || p.status.toLowerCase().indexOf(this.state.searchValue) !== -1;
        }
        else {
          return p;
        }
      }
    );
    const tableBorderStyle = {
      border: '1.5px solid black'
    };

    const tableHeaderStyle = {
      backgroundColor: 'lightblue'
    };

    let fromValue;
    if (this.state.from == undefined) {
      fromValue = new Date("05/20/2018");
    } else {
      fromValue = this.state.from;
    }

    let toValue;
    if (this.state.to == undefined) {
      toValue = new Date();
    } else {
      toValue = this.state.to;
    }

    let tableData;

    if (this.state.renderedUsers.length == 0) {
      tableData = <div><h3> No Records Found </h3></div>
    }

    else {
      tableData = <div>
        <img src="http://egov.eletsonline.com/wp-content/uploads/2017/10/yash-technologies-pvt-ltd-m-g-road-indore-2de3l.jpg" alt="Yash Technologies" width="150" height="100" id="image-xls" style={{ display: 'none' }} />
        <table id="table-to-xls" style={{ border: '1.5px solid black', width: '95%', display: 'none' }} className="table table-bordered">
          <thead style={tableHeaderStyle}>
            <tr>
              <th style={tableBorderStyle} scope="col" >Expense ID</th>
              <th style={tableBorderStyle} scope="col" >Submission Date</th>
              <th style={tableBorderStyle} scope="col" >Total Amount</th>
              <th style={tableBorderStyle} scope="col">Expense Name</th>
              <th style={tableBorderStyle} scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {this.state.renderedUsers.map((p) => (
              <tr scope="row">
                <td style={tableBorderStyle}>{p.expenseID}</td>
                <td style={tableBorderStyle}>{p.creationDate}</td>
                <td style={tableBorderStyle}>${p.amount}</td>
                <td style={tableBorderStyle}>{p.expenseName}</td>
                <td style={tableBorderStyle}>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table id="table-to-xls-1" style={{ border: '1.5px solid black', width: '95%' }} className="table table-bordered">
          <thead style={tableHeaderStyle}>
            <tr>
              <th style={tableBorderStyle} scope="col" >Expense ID</th>
              <th style={tableBorderStyle} scope="col" >Submission Date</th>
              <th style={tableBorderStyle} scope="col" >Total Amount</th>
              <th style={tableBorderStyle} scope="col">Expense Name</th>
              <th style={tableBorderStyle} scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {renderedUsers1.map((p) => (
              <tr scope="row">
                <td style={tableBorderStyle}>{p.expenseID}</td>
                <td style={tableBorderStyle}>{p.creationDate}</td>
                <td style={tableBorderStyle}>${p.amount}</td>
                <td style={tableBorderStyle}>{p.expenseName}</td>
                <td style={tableBorderStyle}>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <select style={{ float: 'left', marginLeft: '1%', marginTop: '2%', width: '6%' }} id='select' name='group' className='form-control' size='1' onChange={this.onToggleDropDown}>
            <option value='5'>5</option>
            <option value='10'>10</option>
            <option value='25'>25</option>
          </select>
          <div style={{ float: 'right', marginRight: '5%', marginBottom: '10%' }}>
            <Pagination
              hideDisabled
              prevPageText='prev'
              nextPageText='next'
              firstPageText='first'
              lastPageText='last'
              activePage={this.state.activePage}
              itemsCountPerPage={this.state.itemsCountPerPage}
              totalItemsCount={this.state.renderedUsers.length}
              pageRangeDisplayed={5}
              onChange={this.handlePageChange}
            />
          </div>
        </div>
      </div>
    }

    return (
      <div style={{ marginLeft: '17%' }}>
        <h3 style={{ marginBottom: '2%' }} >Expense Status</h3>
        <div className="InputFromTo" style={{ marginBottom: '2%' }}>
          <DayPickerInput
            value={from}
            placeholder=" From"
            format="LL"
            formatDate={formatDate}
            parseDate={parseDate}
            dayPickerProps={{
              selectedDays: [from, { from, to }],
              disabledDays: {
                after: new Date(),
                before: new Date("05/20/2018")
              },
              fromMonth: from,
              toMonth: to,
              modifiers,
              numberOfMonths: 2,
              onDayClick: () => this.to.getInput().focus(),
            }}
            onDayChange={this.handleFromChange}
          />{' '}
          —{' '}
          <span className="InputFromTo-to">
            <DayPickerInput
              ref={el => (this.to = el)}
              value={to}
              placeholder=" To"
              format="LL"
              formatDate={formatDate}
              parseDate={parseDate}
              dayPickerProps={{
                selectedDays: [from, { from, to }],
                disabledDays: {
                  after: new Date(),
                  before: new Date("05/20/2018")
                },
                modifiers,
                month: from,
                fromMonth: from,
                numberOfMonths: 2,
              }}
              onDayChange={this.handleToChange}
            />
          </span>
          <Helmet>
            <style>{`
  .InputFromTo .DayPicker-Day--selected:not(.DayPicker-Day--start):not(.DayPicker-Day--end):not(.DayPicker-Day--outside) {
    background-color: #f0f8ff !important;
    color: #4a90e2;
  }
  .InputFromTo .DayPicker-Day {
    border-radius: 0 !important;
  }
  .InputFromTo .DayPicker-Day--start {
    border-top-left-radius: 50% !important;
    border-bottom-left-radius: 50% !important;
  }
  .InputFromTo .DayPicker-Day--end {
    border-top-right-radius: 50% !important;
    border-bottom-right-radius: 50% !important;
  }
  .InputFromTo .DayPickerInput-Overlay {
    width: 550px;
  }
  .InputFromTo-to .DayPickerInput-Overlay {
    margin-left: -198px;
  }
`}</style>
          </Helmet>
        </div>
        <div style={{ float: 'none', marginBottom: '2%' }}>
          <input id="searchField" style={{ width: '25%', display: 'inline-block' }} className="form-control" type="text" placeholder="Search Expense Name/Status" onChange={this.searchInputChange} aria-label="Search" />
          <button type="submit" style={{ marginLeft: '1%' }} className="btn btn-primary btn-sm" onClick={() => this.clearFilters()}>
            Clear Filters
          </button>
          <div style={{ float: 'right', marginRight: '5%' }}>
            <ReactHTMLTable_ToExcel
              className="download-table-xls-button"
              table="table-to-xls"
              filename={"Expense Sheet - " + currentLoggedinUsername}
              sheet="Expense Sheet"
              buttonText="Download"
              img="image-xls"
              dates={"Expense Report (" + dateFormat(fromValue, "mmm d, yyyy") + "-" + dateFormat(toValue, "mmm d, yyyy") + ")"} />
          </div>
        </div>
        <div className="alert alert-info" role="alert" style={{ width: '40%' }}>
          <strong>Note: </strong>Clear all the filters to download entire history.
        </div>
        <div>
          {tableData}
        </div>
      </div>
    );
  }
}`1`