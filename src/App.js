import { useEffect, useState, useRef } from 'react';
import { AiOutlineSearch } from 'react-icons/ai'
import { BsBoxArrowUpRight } from 'react-icons/bs'

import './App.css';

const DOMAIN = "https://api.giphy.com/v1/"
function App() {
  const [searchType, setSearchType] = useState("gifs");
  const [filter, setFilter] = useState("");
  const [current, setCurrent] = useState(null);
  const [gifList, setGifList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [dragging, setDragging] = useState(false);
  const [initial, setInitial] = useState(null);
  const [dX, setDX] = useState(0);
  const [dY, setDY] = useState(0);


  const searchTypeButtonsRef = useRef(null);
  const dragRef = useRef(null);

  const PARAMS = {
    api_key: process.env.REACT_APP_GIPHY_KEY,
    lang:"en",
  }

  const getTrending = async (type) => {
    const _params = new URLSearchParams({...PARAMS, limit: 5}).toString();

    await fetch(DOMAIN + `${type}/` + "trending?" + _params)
    .then(response => response.json())
    .then( data => {
      const _index = Math.floor(Math.random() * data.data.length)
      setCurrentIndex(_index);
      setCurrent(data.data[_index]);
      setGifList(data.data.map( (item) => ({images: item.images, url: item.url})));
    });
  }

  const changeSearchType = (change) => {
    if (change === searchType) return;
    searchTypeButtonsRef.current.classList.toggle("switch");
    if (filter) {
      search(change);
    } else {
      getTrending(change);
    }
    setSearchType(change);
  }

  useEffect(() => {
    getTrending(searchType);
  }, [])

  const search = async (type) => {
    const _params = new URLSearchParams({...PARAMS, q:filter, offset: Math.floor(Math.random() * 1000)}).toString();
    console.log(_params)

    await fetch(DOMAIN + `${type}/` + "search?" + _params)
    .then(response => response.json())
    .then( data => {
      console.log(data);
      setGifList(data.data.map( (item) => ({images: item.images, url: item.url})));
      setCurrent(data.data[0]);
      setCurrentIndex(0);
    });
  }

  const getClickPos = (e) => {
    let x;
    let y;
    if(e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel'){
        var touch = e.touches[0] || e.changedTouches[0];
        x = touch.pageX;
        y = touch.pageY;
    } else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave') {
        x = e.clientX;
        y = e.clientY;
    }
    return {x, y}
  }

  const click = (e) => {
    let {x, y} = getClickPos(e);
    setInitial({x, y})

    setDragging(true);
  }

  const updateCurrentGif = () => {
        if (dX < 0) {
          if (currentIndex + 1 < gifList.length) {
            setCurrent(gifList[currentIndex + 1]);
            setCurrentIndex(currentIndex + 1);
          } else {
            setCurrent(gifList[0]);
            setCurrentIndex(0);
          }
        } else {
          if (currentIndex - 1 >= 0) {
            setCurrent(gifList[currentIndex - 1]);
            setCurrentIndex(currentIndex - 1);
          } else {
            setCurrent(gifList[gifList.length - 1]);
            setCurrentIndex(gifList.length - 1);
          }
        }
  }

  const unclick = () => {
    setInitial(null);

    if (Math.abs(dX) > 0.40 * dragRef.current.clientWidth) {
      const direction = dX < 0 ? 0 : 1;


      dragRef.current.classList.add(direction === 0 ? "exitLeft" : "exitRight");
      console.log("exit");
      const setNew = setTimeout(() => {
        updateCurrentGif();
      }, 250);


      const time = setTimeout(() => {
        if (direction === 0) {
          dragRef.current.classList.remove("exitLeft");
          dragRef.current.style.transform = "translateX(600px)";

          dragRef.current.classList.add("enterRight");
        } else {
          dragRef.current.classList.remove("exitRight");
          dragRef.current.style.transform = "translateX(-600px)";

          dragRef.current.classList.add("enterLeft");

        }
        setTimeout(() => {
          if (direction === 0) {
            dragRef.current.classList.remove("enterRight");
          } else {
            dragRef.current.classList.remove("enterLeft");
          }
          dragRef.current.style.transform = "translateX(0)";
        }, 500);
      }, 500);
    }

    setDX(0);
    setDY(0);


    setDragging(false);
  }

  const clickNDrag = (e) => {
    if (!dragging) return;
    let {x, y} = getClickPos(e);


    setDX(-initial.x + x);
    setDY((initial.x - x) / e.target.clientWidth);

  }

  return (
    <div className="App">
      <div className='title'>
        <h1>GIPHY</h1>
        <img src='/giphylogo.png' alt='' />
      </div>
      <div className='searchBar'>
        <input type="text" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <button onClick={() => search(searchType)} disabled={!filter} ><AiOutlineSearch /></button>
      </div>
      <div className='searchTypeButtons' ref={searchTypeButtonsRef}>
        <span></span>
        <div onClick={() => changeSearchType("gifs")} >GIFS</div>
        <div onClick={() => changeSearchType("stickers")} >STICKERS</div>
      </div>
      <div className='gifContainer' onMouseDown={(e) => click(e)} onMouseUp={() => unclick()} onMouseMove={(e) => clickNDrag(e)}  onTouchStart={(e) => click(e)} onTouchEnd={() => unclick()} onTouchMove={(e) => clickNDrag(e)}  >
        <div className='gifCardContainer' style={{ transform: `translateX(${dX}px)`}} ref={dragRef}>
          <div className='gifCard' style={{ transform: `rotateY(${Math.min(Math.max(dX, -30), 30)}deg)`}}  >
          { current ?
            <img src={current.images.original.url} alt="" draggable={false} />
            : <div style={{ color: "white", width: "200px", height: "200px", background: "black", display:'flex', justifyContent: "center", alignItems: "center", borderRadius: "10px"}} >
                <p style={{ margin: "auto" }}>Nothing here :(</p>
              </div>
          }
          </div>
        </div>
      </div>
      <div className='goToSourceBtn'><a href={current && current.url} target="_blank" ><button><BsBoxArrowUpRight /></button></a></div>
    </div>
  );
}

export default App;
