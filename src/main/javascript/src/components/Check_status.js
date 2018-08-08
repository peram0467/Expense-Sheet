import React from "react";
import moment from 'moment';
import Helmet from 'react-helmet';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import { formatDate, parseDate } from "react-day-picker/moment";
import 'whatwg-fetch';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';

export class Check_status extends React.Component {

  constructor(props) {
    super(props);
    props = window.props;
    this.handleFromChange = this.handleFromChange.bind(this);
    this.handleToChange = this.handleToChange.bind(this);
    this.filterDateRange = this.filterDateRange.bind(this);
    this.searchInputChange = this.searchInputChange.bind(this);
    this.clearFilters = this.clearFilters.bind(this);
    this.state = {
      statuses: [],
      searchValue: '',
      sortValue: null,
      from: undefined,
      to: undefined,
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
  }

  clearFilters() {
    document.getElementById("searchField").value = "";
    this.state.searchValue = '';
    var from = this.state.from = undefined;
    var to = this.state.to = undefined;
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
    var to = this.state.to;
    this.filterDateRange(from, to);
  }

  handleToChange(to) {
    this.setState({ to }, this.showFromMonth);
    var from = this.state.from;
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
    let query = "username=" + currentLoggedinUsername + "&startDate=" + from + "&endDate=" + to;
    let url = "expenses?" + query

    fetch(url)
      .then(res => res.json())
      .then(res => {
        this.setState({
          statuses: res
        });
      });
  }

  handleSubmitSuccess(data) {
    this.setState({
      statuses: data
    });
  }

  handleSubmitFailure(error) {
    console.log(error);
  };

  componentWillMount() {
    this.filterDateRange(undefined, undefined);
  }

  render() {
    const currentLoggedinUsername = props.userName;
    const { from, to } = this.state;
    const modifiers = { start: from, end: to };
    let sortedExpensesBySearch = this.state.statuses.filter(
      (p) => {
        if (this.state.searchValue) {
          return p.reason.toLowerCase().indexOf(this.state.searchValue) !== -1 || p.approvalStatus.toLowerCase().indexOf(this.state.searchValue) !== -1;
        }
        else {
          return p;
        }
      }
    );

    var tableBorderStyle = {
      border: '1.5px solid black'
    };

    var tableHeaderStyle = {
      backgroundColor: 'lightblue'
    };

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
                  before: from
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
          <input id="searchField" style={{ width: '25%', display: 'inline-block' }} className="form-control" type="text" placeholder="Search Reason/Status" onChange={this.searchInputChange} aria-label="Search" />
          <button type="submit" style={{ marginLeft: '1%' }} className="btn btn-primary btn-sm" onClick={() => this.clearFilters()}>
            Clear Filters
            </button>
          <div style={{ float: 'right', marginRight: '5%' }}>
            <ReactHTMLTableToExcel
              className="download-table-xls-button"
              table="table-to-xls"
              filename={"Expense Sheet - " + currentLoggedinUsername}
              sheet="Expense Sheet"
              buttonText="Download"
              style />
          </div>
        </div>
        <div>
          <table id="table-to-xls" style={{ border: '1.5px solid black', width: '95%' }} className="table table-bordered">
            <thead style={tableHeaderStyle}>
              <tr>
                <th style={tableBorderStyle} scope="col" >Creation Date</th>
                <th style={tableBorderStyle} scope="col" >Total Amount</th>
                <th style={tableBorderStyle} scope="col">Reason for Expense</th>
                <th style={tableBorderStyle} scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedExpensesBySearch.map((p) => (
                <tr scope="row">
                  <td style={tableBorderStyle}>{p.creationDate}</td>
                  <td style={tableBorderStyle}>{p.amount}</td>
                  <td style={tableBorderStyle}>{p.reason}</td>
                  <td style={tableBorderStyle}>{p.approvalStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}