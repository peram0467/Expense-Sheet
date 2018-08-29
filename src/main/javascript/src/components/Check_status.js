import React from "react";
import moment from 'moment';
import Helmet from 'react-helmet';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import { formatDate, parseDate } from "react-day-picker/moment";
import 'whatwg-fetch';
import ReactHTMLTable_ToExcel from "./ReactHTMLTable_ToExcel";
import Pagination from "react-js-pagination";
import ReactModal from 'react-modal';
import { css } from "glamor";
import Alert from 'react-s-alert';

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
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.browseButtonClicked = this.browseButtonClicked.bind(this);
    this.handleUploadFilesChange = this.handleUploadFilesChange.bind(this);
    this.isPDFfile = this.isPDFfile.bind(this);
    this.validateSize = this.validateSize.bind(this);
    this.updateTableHTML = this.updateTableHTML.bind(this);
    this.addRemoveButtonEvents = this.addRemoveButtonEvents.bind(this);
    this.onCommentBoxChange = this.onCommentBoxChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSubmitCommentSuccess = this.handleSubmitCommentSuccess.bind(this);
    this.handleSubmitCommentFailure = this.handleSubmitCommentFailure.bind(this);

    this.state = {
      statuses: [],
      files: [],
      bills: [],
      comments: [],
      renderedUsers: [],
      renderedUsers1: [],
      searchValue: '',
      sortValue: null,
      from: undefined,
      to: undefined,
      activePage: 1,
      itemsCountPerPage: 5,
      showModal: false,
      currentExpenseID: 0,
      currentExpenseFirstName: '',
      currentExpenseLastName: '',
      currentExpenseCreationDate: 0,
      currentExpenseName: '',
      currentExpenseAmount: 0,
      currentStatusInfo: '',
      currentComment: '',
      disableSubmit: true
    };
  }

  browseButtonClicked(event) {
    document.getElementById('hiddenFileControl').click();
  }
  handleUploadFilesChange(event) {
    let uploadedFilesList = event.target.files;
    for (let i = 0; i < uploadedFilesList.length; i++) {
      //not executable and size<2MB
      if (this.isPDFfile(uploadedFilesList[i]) && this.validateSize(uploadedFilesList[i])) {
        this.state.bills.push(uploadedFilesList[i]);
      }
    }
    this.updateTableHTML(this.state.bills);
  }

  isPDFfile(file) {
    if (file.type == "application/pdf") {
      return true;
    } else {
      alert("Upload only pdf files");
      return false;
    }
  }

  validateSize(file) {
    let fileSize = file.size / 1024 / 1024;
    if (fileSize < 2) {
      return true;
    } else {
      alert(file.name + " exceeds 2 MB size, please upload a file that is less than 2 MB");
      return false;
    }
  }
  updateTableHTML(updatedFiles) {
    let table = document.getElementById("uploadTable");
    table.innerHTML = "";
    for (let i = 0; i < updatedFiles.length; ++i) {
      let currentFile = updatedFiles[i];

      let row = table.insertRow(i);
      let cell1 = row.insertCell(0);
      let cell2 = row.insertCell(1);

      let buttonHTML = document.createElement("BUTTON");
      let button_ID = currentFile.name + "_" + i;;
      buttonHTML.setAttribute("id", button_ID);
      buttonHTML.setAttribute("class", "btn btn-link");
      buttonHTML.setAttribute("type", "button");
      buttonHTML.appendChild(document.createTextNode("remove"));
      cell1.innerText = currentFile.name
      cell2.appendChild(buttonHTML)
    }
    this.addRemoveButtonEvents(this.state.bills);
  }
  addRemoveButtonEvents(updatedFiles) {
    let that = this;
    for (let id = 0; id < updatedFiles.length; id++) {
      let button_ID = updatedFiles[id].name + "_" + id;
      let button = document.getElementById(button_ID);
      button.addEventListener("click", function (event) {
        let button_ID = event.currentTarget.id;
        let n = button_ID.lastIndexOf("_");
        let index = button_ID.substring(n + 1);
        that.state.bills.splice(index, 1);
        that.updateTableHTML(that.state.bills);
      });
    }
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

  handleOpenModal(currentExpenseID, currentExpenseCreationDate, currentExpenseName, currentExpenseAmount, currentStatusInfo) {
    this.setState({
      currentExpenseID: currentExpenseID,
      currentExpenseCreationDate: currentExpenseCreationDate,
      currentExpenseName: currentExpenseName,
      currentExpenseAmount: currentExpenseAmount,
      currentStatusInfo: currentStatusInfo
    });

    fetch("/approvals/" + currentExpenseID)
      .then(res => res.json())
      .then(res => {
        this.setState({
          files: res
        });
      });

    fetch("/expenses/" + currentExpenseID + "/comments")
      .then(res => res.json())
      .then(res => {
        this.setState({
          comments: res
        });
      });

    this.setState({ showModal: true });
  }

  handleCloseModal() {
    this.setState({ showModal: false, disableSubmit: true });
    while (this.state.bills.length > 0) {
      this.state.bills.pop();
    }
  }

  handleFileDisplay(fileID, fileName, fileType) {
    fetch("/approvals/" + this.state.currentExpenseID + "/file/" + fileID)
      .then(function (response) {
        return response.blob();
      })
      .then(function (data) {
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(new Blob([data]), fileName);
        } else {
          var url = URL.createObjectURL(new Blob([data], {
            type: fileType
          }));
          window.open(url, "_blank");
        }
      });
  }

  onCommentBoxChange(event) {
    if (event.target.value != "") {
      this.setState({ currentComment: event.target.value, disableSubmit: false });
    }
    else {
      this.setState({ disableSubmit: true });
    }
  }

  handleSubmit() {
    if (this.state.currentComment != "") {
      let formData = new FormData();
      formData.append("expenseID", this.state.currentExpenseID);
      formData.append("username", props.userName);
      formData.append("comment", this.state.currentComment);

      for (let i = 0; i < this.state.bills.length; i++) {
        formData.append("bills", this.state.bills[i]);
      }

      $.ajax({
        url: "/expenses/" + this.state.currentExpenseID + "/comments",
        type: "POST",
        encType: "multipart/form-data",
        contentType: false,
        processData: false,
        data: formData,
        success: this.handleSubmitCommentSuccess,
        error: this.handleSubmitCommentFailure
      });
    }
    else {
      alert("Please enter some comments into the comments field");
    }

  }

  handleSubmitCommentSuccess() {
    Alert.success('Your comment is succesfully posted', {
      position: 'top'
    });
    this.setState({ disableSubmit: true });
    while (this.state.bills.length > 0) {
      this.state.bills.pop();
    }
    this.handleCloseModal();
  }

  handleSubmitCommentFailure() {
    Alert.error('There is an error in form submission', {
      position: 'top'
    });
    this.setState({ disableSubmit: true });
    while (this.state.bills.length > 0) {
      this.state.bills.pop();
    }
    this.handleCloseModal();
  }

  render() {
    const currentLoggedinUsername = props.userName;
    const { from, to } = this.state;
    const { renderedUsers1 } = this.state;
    const modifiers = { start: from, end: to };
    const dateFormat = require('dateformat');
    const hiddenFileControlStyle = css({
      visible: "none"
    });

    let isSubmittedOrPending = (this.state.currentStatusInfo == "Review Pending" || this.state.currentStatusInfo == "Submitted");

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
                <td style={tableBorderStyle}>{p.statusInfo}</td>
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
                <td style={tableBorderStyle}>
                  <button
                    className="btn btn-link"
                    onClick={() => { this.handleOpenModal(p.expenseID, p.creationDate, p.expenseName, p.amount, p.statusInfo) }}>
                    <strong>{p.expenseID}</strong></button>
                </td>
                <td style={tableBorderStyle}>{p.creationDate}</td>
                <td style={tableBorderStyle}>${p.amount}</td>
                <td style={tableBorderStyle}>{p.expenseName}</td>
                <td style={tableBorderStyle}>{p.statusInfo}</td>
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
        <Alert stack={true} timeout={5000} />
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
        <div>
          <ReactModal
            isOpen={this.state.showModal}
            onRequestClose={this.handleCloseModal}
          >
            <div>
              <h4><strong>Expense information for ID : </strong>{this.state.currentExpenseID}</h4>
              <p><strong>Submission date : </strong>{this.state.currentExpenseCreationDate}</p>
              <p><strong>Expense name: </strong>{this.state.currentExpenseName}</p>
              <p><strong>Amount : </strong>{this.state.currentExpenseAmount}</p>
              <p><strong>Status : </strong>{this.state.currentStatusInfo}</p>
              <p><strong>Attachments : </strong></p>
              <ul className="form-group col-lg-12" style={{ float: 'unset', paddingLeft: "5%" }}>
                {this.state.files.map((p) =>
                  <li>
                    <button className="btn btn-link" type="button"
                      onClick={() => { this.handleFileDisplay(p.fileID, p.fileName, p.fileType) }}>
                      {p.fileName}
                    </button>
                  </li>
                )}
              </ul>

              <p><strong>Comments : </strong></p>
              {this.state.comments.length > 0 ? (
                <div className="panel-group">
                  {this.state.comments.map((c) =>
                    <div className="panel panel-info" style={{ width: "75%" }}>
                      <div className="panel-heading">{c.username}<p style={{ float: 'right', color: '#999', fontSize: "smaller" }}>{c.commentedDate}</p></div>
                      <div className="panel-body">{c.comment}</div>
                    </div>
                  )}
                </div>
              ) : <div><p>No Comments</p></div>
              }

              <br />
              <form>
                {isSubmittedOrPending ? (
                  <div>
                    <div className="form-group col-lg-8">
                      <input type="file"
                        {...hiddenFileControlStyle}
                        className="invisible"
                        id="hiddenFileControl"
                        onChange={this.handleUploadFilesChange}
                        multiple
                        required />
                      <input id="FileControl"
                        className="form-control-file"
                        type="button"
                        value="Browse files"
                        onClick={this.browseButtonClicked}
                      />
                    </div>
                    <div className="form-group col-lg-8">
                      <table id="uploadTable" border='0' style={{ width: '60%' }}></table>
                      <br />
                      <label>Comment:</label>
                      <textarea className="form-control" rows="5" id="commentBox" onChange={this.onCommentBoxChange}></textarea>
                      <br />
                      <button className="btn btn-primary"
                        type="button"
                        disabled={this.state.disableSubmit}
                        onClick={() => { this.handleSubmit() }}>Submit</button>
                      <button className="btn btn-link" type="button" onClick={this.handleCloseModal}>Close</button>
                    </div>
                  </div>)
                  : (<div>
                    <button className="btn btn-link" type="button" onClick={this.handleCloseModal}>Close</button>
                  </div>)
                }
              </form>
            </div>
          </ReactModal>
        </div>
      </div>
    );
  }
}`1`