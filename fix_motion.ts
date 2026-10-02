import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// The original map return is on line 497: 'return ('
// Then 'key={reel.id}'
// Then 'whileHover={{ y: -6, scale: 1.02 }}'

content = content.replace(
  '<motion.div\n                  key={reel.id}',
  '<motion.a\n                  key={reel.id}'
);

content = content.replace(
  '                  </motion.div>\n              );\n            })}\n          </div>',
  '                  </motion.a>\n              );\n            })}\n          </div>'
);

const sLiked = content.indexOf('{liked ? \'5.8K\' : reel.likes}');
if (sLiked !== -1) {
    content = content.replace(
        '<Heart size={11} className={liked ? "fill-rose-500 text-rose-500" : "text-sakura"} /> {liked ? \'5.8K\' : reel.likes}',
        '<Heart size={11} className="text-sakura" /> {reel.likes}'
    );
}

fs.writeFileSync('src/pages/Home.tsx', content);
console.log("Fixed motion tag");
