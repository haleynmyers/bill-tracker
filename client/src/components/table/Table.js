import React, { useEffect, useState } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Paper,
  Container,
  IconButton,
  Checkbox
} from "@material-ui/core";

import { useUserContext } from "../../utils/Context";
import HistoryIcon from "@material-ui/icons/History";

import API from "../../utils/API";
import NewBill from "../newBill/NewBill";
import BillsToolbar from "./Toolbar";
import BillsTableHead from "./TableHead";

//TABLE info - styles
const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 250,
    paddingLeft: 0,
    paddingRight: 0,
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
}));

const StyledTableCell = withStyles((theme) => ({
  body: {
    fontSize: 16,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

//begin export default of our TABLE
export default function EnhancedTable(props) {
  const classes = useStyles();
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("amount");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);
  const [state, dispatch] = useUserContext();

  // let rows = [];
  // const [state, dispatch] = useUserContext();
  // console.log(state);
  // const userData = JSON.parse(localStorage.getItem('User'));

  useEffect(() => {
    if(state.user) {
      dispatch({type: 'getBills', userId: state.user._id})
    }
  }, [state.user]);

  useEffect(() => {
    if (state.bills) {
      setRows(state.bills);
    }
  }, [state.bills])

  //sorting by date or amount
  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    } if (b[orderBy] > a[orderBy]) {
      return 1;

    }
    return 0;
  }


  function getComparator(order, orderBy) {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, _id) => {
    const selectedIndex = selected.indexOf(_id);
    
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, _id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
    console.log(newSelected);
  };

  //function to handle the pagination: change page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  //function to handle the pagination: number of rows per page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;


  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  function getUserBills(){
    dispatch({type: 'getBills', userId: state.user._id})
  }  

  //render table
  return (
    <Container maxWidth="lg" className={classes.table}>
      <Paper className={classes.paper}>
        <BillsToolbar numSelected={selected.length} selected={selected} />
          <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            aria-label="enhanced table"
          >
            <BillsTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected( row._id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <StyledTableRow
                      hover
                      onClick={(event) => handleClick(event, row._id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.name}
                      selected={isItemSelected}
                    >
                      <StyledTableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{ "aria-labelledby": labelId }}
                        />
                      </StyledTableCell>
                      <StyledTableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                      >
                        {row.name}
                      </StyledTableCell>

                      <StyledTableCell align="right">
                        $ {row.amount}
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        {row.date}
                      </StyledTableCell>
                    </StyledTableRow>
                  );
                })}
            
            </TableBody>
          </Table>
        </TableContainer>
        <NewBill onClose={() => {getUserBills()}}/>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
}
