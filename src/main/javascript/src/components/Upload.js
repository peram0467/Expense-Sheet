import React from "react";
import { css } from "glamor";
import Alert from 'react-s-alert';

const initialState = {
    name: "",
    disableUpload: true,
    disableSubmit: true,
    files: [],
    excelFileFound: false,
    countOfExcelFiles: 0,
    billsFound: false,
    countOfBills: 0
};


export class Upload extends React.Component {
    constructor() {
        super();
        this.state = {
            name: "",
            disableUpload: true,
            disableSubmit: true,
            files: [],
            excelFileFound: false,
            countOfExcelFiles: 0,
            billsFound: false,
            countOfBills: 0
        };
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleAmountChange = this.handleAmountChange.bind(this);
        this.handleUploadFilesChange = this.handleUploadFilesChange.bind(this);
        this.validateNameAndAmount = this.validateNameAndAmount.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.isExcel = this.isExcel.bind(this);
        this.browseButtonClicked = this.browseButtonClicked.bind(this);
        this.isNotExecutableFile = this.isNotExecutableFile.bind(this);
        this.addRemoveButtonEvents = this.addRemoveButtonEvents.bind(this);
        this.removeExcelFilesAndSaveBills = this.removeExcelFilesAndSaveBills.bind(this);
        this.saveExcelFileAndRequestForBills = this.saveExcelFileAndRequestForBills.bind(this);
        this.saveAllBillsAndRequestForExcelFile = this.saveAllBillsAndRequestForExcelFile.bind(this);
    }
    handleNameChange(event) {
        if (event.target.value != "") {
            this.setState({ name: event.target.value, disableUpload: false, disableSubmit: false });
        }
        else {
            this.setState({ disableUpload: true, disableSubmit: true });
        }
    }

    handleAmountChange(event) {
        if (event.target.value != "") {
            this.setState({ amount: event.target.value, disableUpload: false, disableSubmit: false });
        }
        else {
            this.setState({ disableUpload: true, disableSubmit: true });
        }
    }

    browseButtonClicked(event) {
        document.getElementById('hiddenFileControl').click();
    }
    handleUploadFilesChange(event) {
        let uploadedFilesList = event.target.files;
        for (let i = 0; i < uploadedFilesList.length; i++) {
            //not executable and size<2MB
            if (this.isNotExecutableFile(uploadedFilesList[i]) && this.validateSize(uploadedFilesList[i])) {
                this.state.files.push(uploadedFilesList[i]);
            }
        }
        this.updateTableHTML(this.state.files);
    }
    isNotExecutableFile(file) {
        if (file.type != "application/x-msdownload") {
            return true;
        } else {
            alert("Executable files are not allowed");
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
        this.addRemoveButtonEvents(this.state.files);
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

                that.state.files.splice(index, 1);
                that.updateTableHTML(that.state.files);
            });
        }
    }
    isExcel(file) {
        if (file.type == "application/vnd.ms-excel" ||
            file.type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            return true;
        }
        else {
            return false;
        }
    }

    validateNameAndAmount(name, amount) {
        if (name != undefined && name != "" && amount != undefined && amount != "") {
            return true;
        }
        else {
            this.setState({ disableSubmit: true });
            alert("Complete all fields in the form");
        }
    }

    handleSubmit(event) {
        if (this.validateNameAndAmount(this.state.name, this.state.amount)) {
            let files = this.state.files;
            for (let i = 0; i < files.length; i++) {
                if (this.isExcel(files[i])) {
                    this.state.countOfExcelFiles++;
                    this.state.excelFileFound = true;
                }
                else if (!(this.isExcel(files[i]))) {
                    this.state.countOfBills++;
                    this.state.billsFound = true;
                }
            }
            if (this.state.countOfExcelFiles != 1) {
                if (this.state.countOfExcelFiles < 1) {
                    //save the bills in the state, request for expense sheet
                    let confirmMessage = confirm("Please upload an Expense sheet in .xls or .xlsx or .csv format.");
                    if (confirmMessage) {
                        this.saveAllBillsAndRequestForExcelFile(confirmMessage);
                    } else {
                        this.saveAllBillsAndRequestForExcelFile(confirmMessage);
                    }
                }
                // If multiple excel files are found, remove excel files and save bills in the state.
                else if (this.state.countOfExcelFiles > 1) {
                    let confirmMessage = confirm("Please upload only one Expense sheet in .xls or .xlsx format.");
                    if (confirmMessage) {
                        this.removeExcelFilesAndSaveBills(confirmMessage);
                    } else {
                        this.removeExcelFilesAndSaveBills(confirmMessage);
                    }
                }
            }

            // This will execute when only one expense sheet is uploaded
            else if (this.state.countOfExcelFiles == 1 && this.state.countOfBills < 1) {
                // save the excel sheet in the state, request for bills
                let confirmMessage = confirm("Please upload all appropriate bills.");
                if (confirmMessage) {
                    this.saveExcelFileAndRequestForBills(confirmMessage);
                } else {
                    this.saveExcelFileAndRequestForBills(confirmMessage);
                }
            }
            else if (this.state.countOfExcelFiles == 1 && this.state.countOfBills >= 1) {


                let formData = new FormData();
                formData.append("username", props.userName);
                formData.append("creationDate", new Date());
                formData.append("expenseName", this.state.name);
                formData.append("amount", this.state.amount);
                formData.append("status", "Submitted");

                for (let i = 0; i < files.length; i++) {
                    formData.append("bills", files[i]);
                }
                let that = this;

                $.ajax({
                    url: "/expenses",
                    type: "POST",
                    encType: "multipart/form-data",
                    contentType: false,
                    processData: false,
                    data: formData,
                    success: this.handleSubmitSuccess(that),
                    error: this.handleSubmitFailure

                });
            }
        }
    }

    saveAllBillsAndRequestForExcelFile(confirmMessage) {
        let tempExpenseName = this.state.name;
        let tempArray = this.state.files;
        this.setState(initialState);
        this.setState({
            name: tempExpenseName,
            disableUpload: false,
            files: tempArray
        });
    }
    removeExcelFilesAndSaveBills(confirmMessage) {
        let tempExpenseName = this.state.name;
        this.setState(initialState);
        this.setState({
            name: tempExpenseName,
            disableUpload: false
        });
        //Remove all excel files and save bills temporarily.
        let tempArray = this.state.files;
        let that = this;
        let excelFoundInTheArray = true;

        while (excelFoundInTheArray) {
            let currentIndex = 0;
            excelFoundInTheArray = tempArray.some(function (item, index, object) {
                currentIndex = index;
                return that.isExcel(item);
            });
            if (excelFoundInTheArray) {
                tempArray.splice(currentIndex, 1);
            } else {
                break;
            }
        }
        this.updateTableHTML(tempArray);
        this.setState({ files: tempArray });
    }
    saveExcelFileAndRequestForBills(confirmMessage) {
        let tempExpenseName = this.state.name;
        let tempArray = this.state.files;
        this.setState(initialState);
        this.setState({
            name: tempExpenseName,
            disableUpload: false,
            files: tempArray
        });
    }

    handleCancel(event) {
        this.setState(initialState);
        while (this.state.files.length > 0) {
            this.state.files.pop();
        }
        document.getElementById("myForm").reset();
        document.getElementById("uploadTable").innerHTML = "";
    }

    handleSubmitSuccess(that) {
        Alert.success('Your expense is succesfully uploaded', {
            position: 'top'
            });
            that.handleCancel();
    }

    handleSubmitFailure(error) {
        Alert.error('There is an error in form submission', {
            position: 'top'
            });
            
    }

    render() {

        const hiddenFileControlStyle = css({
            visible: "none"
        });
        const divStyle = css({
            marginLeft: '17%',
            marginRight: '5%',
            textAlign: 'justify'
        });

        return (
            <div style={{ marginLeft: '17%' }}>
                <h3 style={{ marginBottom: '2%' }} >Upload Expenses</h3>
                <div className="alert alert-info" role="alert" style={{ width: '60%' }}>
                    <strong>Note: </strong>Review the help section before you submit expenses
                </div>
                <Alert stack={true} timeout={5000} />
                <form id="myForm" style={{ marginLeft: '-1%' }}>
                    <div className="form-group col-lg-7">
                        <label>Enter a name for your expense</label>
                        <input id="NameControl"
                            className="form-control"
                            type="text"
                            maxLength="20"
                            onChange={this.handleNameChange}
                            required />
                    </div>
                    <div className="form-group col-lg-7">
                        <label>Total amount spent</label>
                        <input id="AmountControl"
                            className="form-control"
                            type="number"
                            onChange={this.handleAmountChange}
                            required />
                    </div>

                    <div className="form-row">
                        <div className="form-group col-lg-8">
                            <label>Upload Expense sheet along with appropriate bills</label>
                            <input type="file"
                                {...hiddenFileControlStyle}
                                className="invisible"
                                id="hiddenFileControl"
                                disabled={this.state.disableUpload}
                                onChange={this.handleUploadFilesChange}
                                multiple
                                required />

                            <input id="FileControl"
                                className="form-control-file"
                                type="button"
                                value="Browse files"
                                disabled={this.state.disableUpload}
                                onClick={this.browseButtonClicked}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group col-lg-8">

                            <div>
                                <table id="uploadTable" border='0' style={{ width: '60%' }}>

                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group col-lg-8">
                            <button className="btn btn-primary" type="button" disabled={this.state.disableSubmit} onClick={this.handleSubmit}>Submit my Expense report</button>
                            <button className="btn btn-link" type="reset" onClick={this.handleCancel}> Cancel </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}