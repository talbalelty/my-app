import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button
      id={"square" + props.id}
      className={props.extraClass}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    let extraClassName = 'square';
    if (this.props.winnerCells && this.props.winnerCells.indexOf(i) > -1) {
      extraClassName = 'square square-win';
    }
    
    return (
      <Square
        key={i}
        id={i}
        extraClass = {extraClassName}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderBoard() {
    const arraySize = 3;
    let rows = [];
    for (let i = 0; i < arraySize; i++) {
      let col = [];
      for (let j = 0; j < arraySize; j++) {
        col.push(this.renderSquare(i * arraySize + j));
      }
      rows.push(<div key={"row" + i} className="board-row"> {col} </div>);
    }
    return rows;
  }

  render() {
    let rows = this.renderBoard();
    return (
      <div>
        {rows}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        coordinate: null,
      }],
      xIsNext: true,
      sortOrder: true,
      stepNumber: 0,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';

    const col = (i % Math.sqrt(squares.length)) + 1;
    const row = Math.floor(i / Math.sqrt(squares.length) + 1);
    this.setState({
      history: history.concat([{
        squares: squares,
        coordinate: '(' + col + ', ' + row + ')',
      }]),
      xIsNext: !this.state.xIsNext,
      stepNumber: history.length,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  createMovesList(history) {
    const moves = history.map((step, move) => {
      const description = move ?
        'Go to move ' + step.coordinate :
        'Go to game start';
      const formatClass = (move == this.state.stepNumber ? 'bold' : '');
      return (
        <li key={move}>
          <button className={formatClass} onClick={() => this.jumpTo(move)}>
            {description}
          </button>
        </li>
      );
    });
    return this.state.sortOrder ? moves : moves.reverse();
  }

  toggleSortOrder() {
    let label = this.state.sortOrder ? "Ascending" : "Descending";
    return (
      <button onClick={() => this.setState({ sortOrder: !this.state.sortOrder, })}>
        {label}
      </button>
    );
  }

  stringStatus(winner) {
    if (winner === 'draw') {
      return 'The match is a draw';
    } else if (winner) {
      return 'Winner ' + winner;
    } else {
      return 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winnerInfo = calculateWinner(current.squares);
    const winner = winnerInfo ? winnerInfo[0] : winnerInfo;
    const winnerCells = winnerInfo ? winnerInfo.slice(1) : winnerInfo;
    const status = this.stringStatus(winner);
    const sort = this.toggleSortOrder();
    const moves = this.createMovesList(history);
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winnerCells={winnerCells}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div className="sort-button">Sort Order: {sort}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], a, b, c];
    }
  }

  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === null) {
      return null;
    }
  }
  return ['draw', null];
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);