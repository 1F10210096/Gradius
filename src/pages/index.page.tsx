
import { useAtom } from 'jotai';
import Konva from 'konva';
import { useCallback, useEffect, useState } from 'react';
import { Circle, Layer, Rect, Stage } from 'react-konva';
import { userAtom } from 'src/atoms/user';
import { useState } from 'react';
import { Layer, Line, Stage } from 'react-konva';
import { Loading } from 'src/components/Loading/Loading';
import { apiClient } from 'src/utils/apiClient';
const Home = () => {
  //黒い枠の中をクリックし、矢印ボタンを押すと、赤い点が動くよー
  const [playerX, setPlayerX] = useState(5);
  const [playerY, setPlayerY] = useState(0);
  const [tamaX, settamaX] = useState(0);
  const [tamaY, settamaY] = useState(2);
  const [user] = useAtom(userAtom);
  const [dx, setDx] = useState(-1); // x方向の移動量
  const dx2 = 1;
  const [dy, setDy] = useState(0); // y方向の移動量
  const [enemies, setEnemies] = useState<{ x: number; y: number }[]>([
    { x: 5, y: 2 },
    { x: 8, y: 4 },
  ]);
  const [bullet, setbullets] = useState<{ x: number; y: number }[]>([]);
  const [board, setBoard] = useState([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]);
  const hoge = true;
  const keydown = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const game = await apiClient.game.$post({
      body: { x: playerX, y: playerY, key: e.code, board },
    });
    console.log(game.x);
    console.log(game.y);
    setPlayerX(game.x);
    setPlayerY(game.y);
    settamaX(game.y);
    settamaY(game.x);
    setBoard(game.board);
    if (user === null) {
      console.log('a');
    } else {
      console.log(user.id);
    }
  };
  const click = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const newGame = await apiClient.create.$post();
    console.log(newGame);
  };
  //ここまで
  const changeDirection = () => {
    // 移動量をランダムに設定する
    const newDx = -1;
    const newDy = Math.floor(Math.random() * 3) - 1; // -1, 0, 1 のいずれか
    setDx(newDx);
    setDy(newDy);
  };

  const generateEnemy = useCallback(() => {
    const newEnemy = {
      x: 14,
      y: Math.floor(Math.random() * 5),
    };

    setEnemies((prevEnemies) => [...prevEnemies, newEnemy]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const frame = new Konva.Animation((frame) => {
      setEnemies((prevEnemies) => {
        const speed = 2;
        if (frame === undefined) {
          console.log('error');
          return enemies;
        } else {
          const dist = speed * (frame.timeDiff / 1000);
          const newEnemies = prevEnemies.map((enemy) => ({
            ...enemy,
            x: enemy.x + dx * dist,
            y: enemy.y,
          }));
          return newEnemies.filter((enemy) => enemy.x >= 0);
        }
      });
    });

    frame.start();

    const interval = setInterval(() => {
      changeDirection();
      generateEnemy();
    }, 1200);

    return () => {
      frame.stop();
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dx, dy, generateEnemy]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const newBullets = {
          x: playerY,
          y: playerX,
        };
        setbullets((prevbullets) => [...prevbullets, newBullets]);
        console.log(bullet);
        console.log(enemies);
        const tamaAnimation = new Konva.Animation((tama) => {
          setbullets((prevBullets) => {
            if (tama === undefined) {
              console.log('error');
              return prevBullets;
            } else {
              const speed = 2;
              const dist = speed * (tama.timeDiff / 1000);
              const newbullet = prevBullets.map((bullet) => ({
                ...bullet,
                x: bullet.x + dx2 * dist,
                y: bullet.y,
              }));
              return newbullet.filter((bullet) => bullet.x <= 18);
            }
          });
        });
        tamaAnimation.start();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dx2, dy]);
  useEffect(() => {
    const updatedEnemies = enemies.filter((enemy) => {
      for (const bulletObj of bullet) {
        if (Math.floor(enemy.x) === Math.floor(bulletObj.x) && enemy.y === bulletObj.y) {
          return false; // 一致したenemyは除外する
        }
      }
      return true; // 一致しなかったenemyは残す
    });
    setEnemies(updatedEnemies);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bullet]);
  if (!hoge) return <Loading visible />;
  return (
    <>
      <div
        className="container"
        onKeyDown={keydown}
        style={{ border: 'solid' }}
        onClick={click}
        tabIndex={0}
      >
        <div id="key">X:{playerX}</div>
        <div id="key">Y:{playerY}</div>
        <div id="key" />
      </div>
      <div
        id="player"
        style={{
          position: 'absolute',
          left: `${playerX}px`,
          top: `${playerY}px`,
          backgroundColor: 'red',
          width: '10px',
          height: '10px',
        }}
      />
      <div className={styles.board}>
        {board.map((row, y) =>
          // eslint-disable-next-line complexity
          row.map((color, x) => (
            <div className={styles.cell} key={`${x}-${y}`} style={{ position: 'relative' }}>
              {color !== 0 && (
                <Stage width={40} height={40}>
                  <Layer>
                    <Line
                      x={0}
                      y={10}
                      points={[0, 0, 5, 5, 15, 5]}
                      closed
                      strokeWidth={1}
                      stroke="black"
                      fill="white"
                    />
                    <Line
                      x={5}
                      y={15}
                      points={[0, 0, 10, 0, 15, 2.5, 30, 2.5, 20, 7, 20, 5, 0, 5]}
                      strokeWidth={1}
                      closed
                      stroke="black"
                      fill="white"
                    />
                    <Line
                      x={5}
                      y={15}
                      points={[0, 0, 0, 5, -3, 5, -3, 0]}
                      strokeWidth={1}
                      closed
                      stroke="black"
                      fill="white"
                    />
                    <Line
                      x={5}
                      y={15}
                      points={[0, 0, 10, 0, 15, 2.5, 30, 2.5, 20, 7, 20, 5, 0, 5]}
                      strokeWidth={1}
                      closed
                      stroke="black"
                      fill="white"
                    />
                    <Line
                      x={5}
                      y={20}
                      points={[0, 0, 20, 0, 20, 2, 7, 4]}
                      strokeWidth={1}
                      closed
                      stroke="black"
                      fill="white"
                    />
                    <Line
                      x={15}
                      y={12}
                      points={[0, 0, 15, 5, 5, 5]}
                      closed
                      tension={0.5}
                      strokeWidth={1}
                      stroke="black"
                      fill="red"
                    />
                  </Layer>
                </Stage>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
};

// Rectで書いたものをメモ用に残してます(すぐ消します)
/*<Rect
stroke="black"
fill="white"
strokeWidth={1}
x={0}
y={10}
width={20}
height={10}
/>*/
export default Home;
