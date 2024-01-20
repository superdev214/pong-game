import React from "react";
class App extends React.Component {
  constructor() {
    super();
    this.state = {
      animate: [false, false],
      waves: [],
      isStarted: false,
      score: [0, 0],
      playerY: 50,
      opponentY: 40,
      playerSpeed: 0,
      interval: null,
      playerPath: "1",
      computerPath: "5",
      ball: {
        animId: 0,
        ballX: 50,
        ballY: 50,
        ballSpeedX: 0.4,
        ballSpeedY: 0.2,
        radius: 4,
      },
    };
  }
  handleChangePlayerAvator = (val) => {
    this.setState({
      playerPath: val,
    });
  };
  handleChangeComputerAvator = (val) => {
    this.setState({
      computerPath: val,
    });
    console.log(this.state.computerPath);
  };
  handleRoundStart = () => {
    if (this.state.interval) return;

    this.setState({
      interval: setInterval(this.ballMove, 10),
      isStarted: true,
    });
  };

  handlePlayerMove = (event) => {
    if (this.state.interval) {
      let yPercent = (event.clientY * 100) / window.innerHeight - 10;
      const speed = (event.movementY * 100) / window.innerHeight;
      if (yPercent <= 0) {
        yPercent = 0;
      } else if (yPercent > 80) {
        yPercent = 80;
      }
      this.setState({
        playerY: yPercent,
        playerSpeed: speed,
      });
    }
  };

  handleSizeChange = (event) => {
    const ball = { ...this.state.ball, radius: event.target.value / 10 };
    this.setState({
      ball: ball,
    });
  };

  ballMove = () => {
    //opponent movement is also handled here
    let { radius, ballX, ballY, ballSpeedX, ballSpeedY } = this.state.ball;
    const radiusY = (radius * window.innerWidth) / window.innerHeight;
    let { playerY, opponentY } = this.state;
    if (ballX > 98 - radius - ballSpeedX) {
      if (
        ballSpeedX > 0 &&
        ballX > radius &&
        ballY > opponentY - 2 * radius &&
        ballY < opponentY + 10 + 2 * radius
      ) {
        if (ballY < opponentY - radius) {
          this.cornerBounce();
        } else if (ballY > opponentY + 6 + radius) {
          this.cornerBounce("top");
        }
        return this.BounceX("right");
      } else if (ballX > 100) {
        return this.scorePoint(true);
      }
    } else if (ballX < 2 + radius - ballSpeedX) {
      if (
        ballSpeedX < 0 &&
        ballY > playerY - 2 * radius &&
        ballY < playerY + 6 + 2 * radius
      ) {
        if (ballY < playerY - radius) {
          this.cornerBounce("top");
        } else if (ballY > playerY + 6 + radius) {
          this.cornerBounce();
        }
        return this.BounceX("left");
      } else if (ballX < 0 + ballSpeedX) {
        return this.scorePoint();
      }
    }
    if (
      (ballSpeedY > 0 && ballY > 100 - radiusY - ballSpeedY) ||
      (ballSpeedY < 0 && ballY < radiusY + ballSpeedY)
    ) {
      return this.BounceY();
    }
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    const ball = { ...this.state.ball, ...{ ballX: ballX, ballY: ballY } };
    let opponentSpeed = Math.min(ballSpeedY * 0.95, 1.5);
    opponentY += opponentSpeed;
    if (opponentY < 0) opponentY = 0;
    else if (opponentY > 80) opponentY = 80;
    this.setState({
      ball: ball,
      opponentY: opponentY,
    });
  };

  BounceY = () => {
    this.animateBounce();
    const ball = {
      ...this.state.ball,
      ballSpeedY: -this.state.ball.ballSpeedY,
    };
    this.setState({
      ball: ball,
    });
  };

  createWaves = (side) => {
    const waves = this.state.waves.slice();
    const paddleY = side === "left" ? this.state.playerY : this.state.opponentY;
    const waveY = Math.min(
      paddleY + 6,
      Math.max(paddleY, this.state.ball.ballY)
    );
    const currentWave = {
      waveY: waveY,
      waveX: side === "left" ? 2 : 98,
      intensity: Math.abs(this.state.ball.ballSpeedX) / 3,
    };
    waves.push(currentWave);
    this.setState({
      waves: waves,
    });

    setTimeout(() => {
      waves.splice(waves.indexOf(currentWave), 1);
      this.setState({ waves: waves });
    }, 300);
  };

  animateBounce = (side) => {
    const { ballSpeedX, ballSpeedY } = this.state.ball;
    const absSpeedX = Math.abs(ballSpeedX);
    const absSpeedY = Math.abs(ballSpeedY);
    const x = document.head.querySelector("#anim");
    if (x) x.remove(); //delete previous stylesheet with animation
    let angle = (absSpeedY * 3.14 * 57) / absSpeedX / 4; //arctan approximation to get the angle
    angle = Math.min(angle, 60);
    if (ballSpeedY > 0) {
      if (ballSpeedX > 0) angle *= -1;
    } else {
      if (ballSpeedX < 0) angle *= -1;
    }
    let scale = Math.min(1 + absSpeedX / 4, 2); //stretch coefficient
    const color =
      side === "left" ? "purple" : side === "right" ? "#666600" : "#595959";
    const animId = ((ballSpeedX + ballSpeedY) * 100).toFixed(0); //generate unique animation name
    const animSheet = document.createElement("style");
    animSheet.setAttribute("id", "anim");
    document.head.appendChild(animSheet);
    animSheet.innerHTML = `
        @keyframes bounce-animation${animId} {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) scale(1, 1);
            background-color: black;
          }
          20% {
            transform: translate(-50%, -50%) rotate(${angle}deg) scale(${scale}, ${
      1 / scale
    });
            background-color: ${color};
  
          }
          100% {
            transform: translate(-50%, -50%) rotate(${angle}deg) scale(1, 1);
            background-color: black;
          }
        }`;
    this.setState({
      ball: { ...this.state.ball, animId: animId },
    });
  };
  BounceX = (side) => {
    this.animateBounce(side);
    this.createWaves(side);
    const { ballSpeedX, ballSpeedY } = this.state.ball;
    const newSpeedX = ballSpeedX * -1.05;
    const newSpeedY =
      ballSpeedY + (side === "left" ? this.state.playerSpeed : ballSpeedY) / 20;
    const ball = {
      ...this.state.ball,
      ...{ ballSpeedX: newSpeedX, ballSpeedY: newSpeedY },
    };
    this.setState({
      ball: ball,
      animate: side === "left" ? [true, false] : [false, true],
    });
    setTimeout(() => {
      this.setState({ animate: [false, false] });
    }, 300);
  };

  cornerBounce = (up) => {
    const { ballSpeedX, ballSpeedY } = this.state.ball;
    const speedChange = up ? ballSpeedX : -ballSpeedX;
    this.setState({
      ball: {
        ...this.state.ball,
        ...{
          ballSpeedX: ballSpeedX * 0.9,
          ballSpeedY: ballSpeedY + speedChange,
        },
      },
    });
  };
  scorePoint = (player) => {
    const score = this.state.score;
    if (player) score[0]++;
    else score[1]++;
    clearInterval(this.state.interval);
    const ball = {
      ...this.state.ball,
      ...{
        ballX: 50,
        ballY: 50,
        ballSpeedX: 0.4 * Math.sign(Math.random() - 0.5),
        ballSpeedY: Math.random() - 0.5,
        animId: 0,
      },
    };
    this.setState({
      //everything to initial, score updated
      score: score,
      interval: null,
      ball: ball,
      opponentY: 40,
    });
  };

  render() {
    return (
      <main
        className="main"
        onClick={this.handleRoundStart}
        onMouseMove={this.handlePlayerMove}
      >
        <Board
          isStart={this.state.interval}
          handleChangeComputerAvator={this.handleChangeComputerAvator}
          handleChangePlayerAvator={this.handleChangePlayerAvator}
        />

        <div className="score">
          <span>{this.state.score[0]}</span>
          {!this.state.interval && (
            <span style={{ fontSize: "30px" }}>Left Click To Start</span>
          )}
          <span>{this.state.score[1]}</span>
        </div>
        {!this.state.interval && (
          <Options
            onSizeChange={this.handleSizeChange}
            size={this.state.ball.radius}
          />
        )}
        <Paddle
          animate={this.state.animate[0]}
          player={true}
          pos={this.state.playerY}
          playerAvator={this.state.playerPath}
          computerAvator={this.state.computerPath}
        />
        <Ball ball={this.state.ball} />
        <Paddle
          animate={this.state.animate[1]}
          pos={this.state.opponentY}
          playerAvator={this.state.playerPath}
          computerAvator={this.state.computerPath}
        />
        <Waves waves={this.state.waves} />
      </main>
    );
  }
}

const Ball = (props) => {
  const { radius, ballX, ballY, animId } = props.ball;
  const animation = `bounce-animation${animId} 500ms ease-out 1 forwards`;
  const style = {
    top: ballY + "%",
    left: ballX + "%",
    width: 2 * radius + "vw",
    height: 2 * radius + "vw",
    animation: animation,
  };
  const className = "ball";
  return <div className={className} style={style} />;
};

const Board = ({
  props,
  handleChangeComputerAvator,
  handleChangePlayerAvator,
  isStart,
}) => {
  return (
    <div className="board">
      {!isStart && (
        <SelectAvator
          handleChangeComputerAvator={handleChangeComputerAvator}
          handleChangePlayerAvator={handleChangePlayerAvator}
        />
      )}
      {/* <div className="circle circle_side circle_left"></div>
      <div className="circle circle_mid"></div>
      <div className="midline"></div>
      <div className="circle circle_side circle_right"></div> */}
    </div>
  );
};

const Options = (props) => {
  return (
    <div className={"options " + (props.roundIsOn ? "d-none" : "")}>
      <label htmlFor="ballSize">Shroom Pong</label>
      <input
        className="slider"
        onInput={props.onSizeChange}
        onClick={(event) => event.stopPropagation()}
        id="ballSize"
        type="range"
        name="ballSize"
        min="10"
        max="60"
        value={(props.size * 10).toFixed(0)}
      />
      {/* <div className="size__labels">
        <div>small</div>
        <div>large</div>
      </div> */}
    </div>
  );
};

const Paddle = (props) => {
  const player = props.player ? "player" : "opponent";
  const avator = props.player ? props.playerAvator : props.computerAvator;
  const style = {
    top: props.pos + "%",
  };
  const className =
    "paddle__inner " + (props.animate ? "paddle__animation-" + player : "");
  return (
    <div className={"paddle paddle_type-" + player} style={style}>
      <img src={`/img/${avator}.webp`} className={className} />
    </div>
  );
};

const Waves = (props) => {
  const waves = props.waves.map((wave, idx) => {
    const radius = wave.intensity * 10;
    const radiusY = (radius * window.innerWidth) / window.innerHeight;
    const style = {
      top: wave.waveY + "%",
      left: wave.waveX + "%",
      width: radius + "%",
      height: radiusY + "%",
      backgroundColor: wave.waveX == 2 ? "purple" : "yellow",
    };
    return (
      <div key={"wave" + idx} className="wave wave__animate" style={style} />
    );
  });
  return waves;
};
const SelectAvator = ({
  props,
  handleChangePlayerAvator,
  handleChangeComputerAvator,
}) => {
  const Player_path = ["1", "2", "3", "4", "5"];
  const Computer_path = ["6", "7", "8", "9", "10"];
  return (
    <div className="absolute left-0 top-2.5 right-0 grid grid-cols-2">
      <div className="flex justify-between mr-[150px]">
        {Player_path.map((item, index) => {
          return (
            <img
              key={index}
              src={`/img/${item}.webp`}
              className="w-[100px] z-[99999] hover:cursor-pointer hover:border-blue-600 hover:border-2"
              onClick={() => {
                handleChangePlayerAvator(item);
              }}
            />
          );
        })}
      </div>
      <div className="flex justify-between ml-[150px]">
        {Computer_path.map((item, index) => {
          return (
            <img
              key={index}
              src={`/img/${item}.webp`}
              className="w-[100px] z-[99999] hover:cursor-pointer hover:border-blue-600 hover:border-2"
              onClick={() => {
                handleChangeComputerAvator(item);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
export default App;
