require("dotenv").config();

const jsrecommender = require("js-recommender");

const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const express = require("express");
const fileupload = require("express-fileupload");
const app = express();
const cors = require("cors");

const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const bcrypt = require("bcrypt");
const saltRounds = 10;

const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

const mongoose = require("mongoose");
const db = require("./models/index");

mongoose.connect("mongodb://localhost/dogsDb").then(async (value) => {
  const hasRoles = (await db.Role.countDocuments({}).exec()) > 0;
  if (!hasRoles) {
    const adminRole = new db.Role();
    adminRole.name = "Administrator";
    adminRole.isAdmin = true;
    adminRole.save();

    const userRole = new db.Role();
    userRole.name = "User";
    userRole.isDefault = true;
    userRole.save();
  }
});

const port = 3001;
const address = `http://localhost:${port}`;
const corsOptions = { origin: "http://localhost:3000" };
app.use(cors(corsOptions));
app.use(fileupload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true, limit: "50mb" }));
app.use(express.static("images"));

const getUserIdFromToken = (token) => {
  const userData = jwt.verify(token, jwtSecret);
  return userData.userId;
};
const getUserFromToken = async (token) => {
  if (!token) {
    return null;
  }

  const userData = jwt.verify(token, jwtSecret);

  const user = await db.User.findById(userData.userId).populate("role");
  return !user.isActive ? null : user;
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers?.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    req.token = token;
    next();
  } else {
    // Forbidden

    res.sendStatus(403);
  }
};

const saveImages = (base64ImagesArr) => {
  const fileNames = base64ImagesArr.map((img) => {
    const isPng = img.includes("image/png");
    const base64data = img.replace(/^data:image\/(png|jpeg);base64,/, "");
    const filename = uuidv4() + (isPng ? ".png" : ".jpeg");

    fs.writeFileSync(
      path.join(__dirname, "/images/" + filename),
      base64data,
      "base64"
    );

    return filename;
  });

  return fileNames;
};

const deleteImages = (imagesUrlArr) => {
  imagesUrlArr.forEach((image) => {
    const imageName = path.basename(image);
    const imagePath = path.join(__dirname, "/images/" + imageName);
    fs.rmSync(imagePath);
  });
};

app.post("/register", async (req, res) => {
  //validari + adaugare bd
  const values = req.body;
  console.log(values);
  const errors = [];
  if (values.password !== values.rePassword) {
    errors.push(
      "Parola reintrodusă nu se potrivește cu cea introdusă inițial."
    );
  }
  if (values.password.length < 6) {
    errors.push("Parola trebuie să aibă cel puțin 6 caractere.");
  }
  if (!values.ts) {
    errors.push("Nu ești de acord cu Termenii și Condițiile noastre.");
  }

  const emailExists =
    (await db.User.countDocuments({ email: values.email }).exec()) > 0;
  if (emailExists) {
    errors.push("Deja există un utilizatoru cu această adresă de e-mail.");
  }

  const success = !errors.length;

  if (success) {
    try {
      // find default role
      const defaultRole = await db.Role.findOne({ isDefault: true }).exec();
      //insert into db
      const user = new db.User();
      user.name = values.name;
      user.email = values.email;
      user.role = defaultRole._id;

      const hash = await bcrypt.hash(values.password, saltRounds);

      user.password = hash;

      const error = user.validateSync();
      console.log("error = ", error);
      error &&
        errors.push(
          ...Object.values(error.errors).map((error) => error.message)
        );

      !errors.length && (await user.save());
    } catch (err) {
      errors.push("A fost o problemă când am încercat să creăm utilizatorul!");
    }
  }

  res.send({ success: !errors.length, errors: errors });
});
app.post("/login", async (req, res) => {
  const values = req.body;

  const user = await db.User.findOne({ email: values.email })
    .select({ password: true, isActive: true })
    .exec();
  let success = false;
  let userJwt = null;

  if (user) {
    if (!user.isActive) {
      res.send({
        success: false,
        errors: ["Contul a fost blocat"],
      });
      return;
    }
    success = await bcrypt.compare(values.password, user.password); // true
    if (success) {
      userJwt = jwt.sign({ userId: user._id, iat: Date.now() }, jwtSecret);
    }
  }

  res.send({
    success: success,
    errors: success ? [] : ["Credențiale Invalide!"],
    jwt: userJwt,
  });
});

app.get(`/currentUser`, verifyToken, async (req, res) => {
  try {
    const user = await getUserFromToken(req.token);
    if (user) {
      res.send({ success: true, user: user });
    } else {
      throw new Error("user not found");
    }
  } catch (err) {
    console.log(err);
    res.send({ success: false });
  }
});

app.get(`/breeds`, async (req, res) => {
  try {
    const breeds = await db.Breed.find({}).exec();

    res.send({ success: true, breeds: breeds });
  } catch (err) {
    console.log(err);
    res.send({ success: false });
  }
});

app.get(`/counties`, async (req, res) => {
  try {
    const counties = await db.County.find({}).exec();

    res.send({ success: true, counties: counties });
  } catch (err) {
    console.log(err);
    res.send({ success: false });
  }
});

app.post("/post", verifyToken, async (req, res) => {
  //validari + adaugare bd
  const values = req.body;
  console.log(values);
  const errors = [];
  let post;
  try {
    //insert into db
    const user = await getUserFromToken(req.token);

    post = new db.Post();
    post.author = user._id;
    post.unknownBreed = values.breedUnknown;

    if (values.breedUnknown) {
      post.breed = null;
    } else {
      post.breed = values.breed;
    }
    post.gender = values.gender;
    post.age = values.age;
    post.petName = values.petName;
    post.description = values.description;
    post.county = values.county;
    post.wasAdopted = values.wasAdopted;

    const error = post.validateSync();

    if (!error) {
      if (values.images.length < 1) {
        errors.push("Trebuie să alegi cel puțin o imagine!");
      } else if (values.images.length > 5) {
        errors.push();
      } else {
        const imageNames = saveImages(values.images);
        post.images = imageNames.map(
          (imageName) => `${address}/images/${imageName}`
        );
      }
    }

    error &&
      errors.push(...Object.values(error.errors).map((error) => error.message));

    !errors.length && (await post.save());
  } catch (err) {
    errors.push("A fost o problemă când am încercat să creăm această postare!");
  }

  res.send({ postId: post?._id, success: !errors.length, errors: errors });
});
app.get(`/admin/users`, verifyToken, async (req, res) => {
  try {
    const user = await getUserFromToken(req.token);
    if (!user.role.isAdmin) {
      // Forbidden
      res.sendStatus(403);
      return;
    }
    const users = await db.User.find({
      $or: [
        { name: { $regex: req.query.username || "", $options: "i" } },
        { email: { $regex: req.query.username || "", $options: "i" } },
      ],
    })
      .skip(req.query.itemsOffset || 0)
      .limit(req.query.itemsCount || 10)
      .populate(["role"])
      .exec();

    const usersCount = await db.User.count({
      $or: [
        { name: { $regex: req.query.username || "", $options: "i" } },
        { email: { $regex: req.query.username || "", $options: "i" } },
      ],
    }).exec();

    res.send({ success: true, users: users, allItemsCount: usersCount });
  } catch (err) {
    res.send({ success: false });
  }
});
app.get(`/admin/roles`, verifyToken, async (req, res) => {
  try {
    const user = await getUserFromToken(req.token);
    if (!user.role.isAdmin) {
      // Forbidden
      res.sendStatus(403);
    }
    const roles = await db.Role.find({}).exec();

    res.send({ success: true, roles: roles });
  } catch (err) {
    res.send({ success: false });
  }
});

app.get(`/posts`, verifyToken, async (req, res) => {
  try {
    const currentUser = await getUserFromToken(req.token);
    let findParams;
    if (currentUser?.role.isAdmin) {
      findParams = {};
    } else {
      findParams = { isArchived: false, isAuthorActive: true };
    }

    let sortParams = { date: "desc" };

    if (req.query.breed) {
      findParams.breed = req.query.breed;
    }
    if (req.query.county) {
      findParams.county = req.query.county;
    }
    if (req.query.onlyUnadopted === "true") {
      findParams.wasAdopted = false;
    }
    if (req.query.gender) {
      findParams.gender = req.query.gender;
    }

    switch (req.query.sortOrder) {
      case "newest":
        sortParams = { date: "desc" };
        break;
      case "oldest":
        sortParams = { date: "asc" };
        break;
      case "ageDesc":
        sortParams = { age: "desc" };
        break;
      case "ageAsc":
        sortParams = { age: "asc" };
        break;
    }

    const itemsCount = req.query?.itemsCount || 10;
    const itemsOffset = req.query?.itemsOffset || 0;

    const posts = await db.Post.find(findParams)
      .skip(itemsOffset)
      .limit(itemsCount)
      .populate(["author", "breed", "county"])
      .sort(sortParams)
      .exec();

    const postsCount = await db.Post.countDocuments(findParams).exec();

    res.send({ success: true, posts: posts, allItemsCount: postsCount });
  } catch (err) {
    res.send({ success: false });
  }
});

app.get(`/posts/:countyId`, async (req, res) => {
  try {
    const posts = await db.Post.find({ county: req.params.countyId })
      .populate(["breed", "author", "county"])
      .exec();

    res.send({ success: true, posts: posts });
  } catch (err) {
    res.send({ success: false });
  }
});

app.get(`/postsByBreed/:breedId`, async (req, res) => {
  try {
    const posts = await db.Post.find({ breed: req.params.breedId })
      .populate(["breed", "author", "county"])
      .exec();

    res.send({ success: true, posts: posts });
  } catch (err) {
    res.send({ success: false });
  }
});

app.get(`/images/:imageName`, async (req, res) => {
  res.sendFile(path.join(__dirname, `/images/${req.params.imageName}`));
});

app.get(`/post/:postId`, verifyToken, async (req, res) => {
  try {
    const user = await getUserFromToken(req.token);
    const post = await db.Post.findById(req.params.postId)
      .populate(["breed", "author", "county"])
      .exec();

    if ((!post.isArchived && post.isAuthorActive) || user.role.isAdmin) {
      res.send({ success: true, post: post });
    } else {
      res.send({ success: false });
    }
  } catch (err) {
    res.send({ success: false });
  }
});
app.get(`/post/:postId/edit`, verifyToken, async (req, res) => {
  try {
    const user = await getUserFromToken(req.token);
    const post = await db.Post.findById(req.params.postId)
      .populate(["breed", "author", "county"])
      .exec();

    if (user._id.equals(post.author._id) || user.role.isAdmin) {
      res.send({ success: true, post: post });
    } else {
      res.send({ success: false });
    }
  } catch (err) {
    res.send({ success: false });
  }
});
app.get(`/usersPosts/:userId`, async (req, res) => {
  try {
    const posts = await db.Post.find({
      author: req.params.userId,
      isArchived: false,
      isAuthorActive: true,
    })
      .skip(req.query.itemsOffset || 0)
      .limit(req.query.itemsCount || 10)
      .populate(["author", "breed", "county"])
      .exec();

    const postsCount = await db.Post.count({
      author: req.params.userId,
      isArchived: false,
      isAuthorActive: true,
    }).exec();
    res.send({ success: true, posts: posts, allItemsCount: postsCount });
  } catch (err) {
    res.send({ success: false });
  }
});
app.put(`/archivePost/:postId`, verifyToken, async (req, res) => {
  try {
    const currentUser = await getUserFromToken(req.token);
    const values = req.body;

    const post = await db.Post.findOne({
      _id: req.params.postId,
    });

    if (currentUser._id.equals(post.author._id) || currentUser.role.isAdmin) {
      console.log("archive value", values.archiveValue);
      post.isArchived = values.archiveValue;
      await post.save();

      const postConversations = await db.Conversation.find({
        post: post._id,
      }).exec();
      const postConversationsIds = postConversations.map(
        (conversation) => conversation._id
      );

      await db.Message.deleteMany({
        conversation: { $in: postConversationsIds },
      }).exec();
      await db.Conversation.deleteMany({
        _id: { $in: postConversationsIds },
      }).exec();

      const usersFromConversations = new Set();
      postConversations.forEach((conversation) => {
        usersFromConversations.add(conversation.postAuthor);
        usersFromConversations.add(conversation.user);
      });
      usersFromConversations.forEach((user) => {
        io.emit(`conversations updated ${user}`);
      });
      res.send({ success: true });
    } else {
      res.send({ success: false });
    }
  } catch (err) {
    console.log(err);
    res.send({ success: false });
  }
});

app.post("/profileImage", verifyToken, async (req, res) => {
  //validari + adaugare bd
  const values = req.body;
  console.log(values);
  const errors = [];

  try {
    //insert into db

    const user = await getUserFromToken(req.token);

    const removedImage = user.profileImage;
    removedImage && deleteImages([removedImage]);

    const imageName = saveImages(values.image);
    user.profileImage = `${address}/images/${imageName}`;

    const error = user.validateSync();
    error &&
      errors.push(...Object.values(error.errors).map((error) => error.message));

    !errors.length && (await user.save());
    console.log("saved user---------------------");
  } catch (err) {
    errors.push(
      "A fost o problemă când am încercat să adăugăm imaginea de profil!"
    );
  }

  res.send({ success: !errors.length, errors: errors });
});

app.put("/post/:postId/edit", verifyToken, async (req, res) => {
  //validari + adaugare bd
  const values = req.body;
  const errors = [];

  try {
    //insert into db
    const user = await getUserFromToken(req.token);

    const post = await db.Post.findById(req.params.postId);
    if (!post.author.equals(user._id) && !user.role.isAdmin) {
      throw new Error("Doar autorul poate modifica anunțul!");
    }

    post.unknownBreed = values.breedUnknown;

    if (values.breedUnknown) {
      post.breed = null;
    } else {
      post.breed = values.breed;
    }
    post.gender = values.gender;
    post.age = values.age;
    post.petName = values.petName;
    post.description = values.description;
    post.county = values.county;
    post.wasAdopted = values.wasAdopted;

    const error = post.validateSync();

    if (!error) {
      if (values.images.length < 1) {
        errors.push("Trebuie să alegi cel puțin o imagine!");
      } else if (values.images.length > 5) {
        errors.push("Trebuie să alegi maxim 5 imagini!");
      } else {
        //checking if the images are in base64 format!
        const removedImages = post.images.filter(
          (image) => !values.images.includes(image)
        );
        const commonImages = post.images.filter((image) =>
          values.images.includes(image)
        );
        const newImages = values.images.filter(
          (image) => !post.images.includes(image)
        );

        deleteImages(removedImages);
        const addedImages = saveImages(newImages);

        post.images = [
          ...commonImages,
          ...addedImages.map((image) => `${address}/images/${image}`),
        ];
      }
    }

    error &&
      errors.push(...Object.values(error.errors).map((error) => error.message));

    !errors.length && (await post.save());
  } catch (err) {
    errors.push("A fost o problemă când am încercat să creăm această postare!");
  }

  res.send({ success: !errors.length, errors: errors });
});

app.put("/editUser/:userId/role", verifyToken, async (req, res) => {
  const values = req.body;
  const errors = [];

  try {
    //insert into db
    const currentUser = await getUserFromToken(req.token);
    if (
      req.params.userId === currentUser._id.toString() ||
      !currentUser.role.isAdmin
    ) {
      // Forbidden
      res.sendStatus(403);
      return;
    }
    const user = await db.User.findById(req.params.userId);
    user.role = values.roleId;
    await user.save();
  } catch (err) {
    errors.push("A fost o problemă când am încercat să edităm utilizatorul");
  }

  res.send({ success: !errors.length, errors: errors });
});

app.put("/setActivateUser/:userId", verifyToken, async (req, res) => {
  const errors = [];
  const values = req.body;

  try {
    //insert into db
    const currentUser = await getUserFromToken(req.token);

    if (
      req.params.userId === currentUser._id.toString() ||
      !currentUser.role.isAdmin
    ) {
      // Forbidden
      res.sendStatus(403);
      return;
    }
    const user = await db.User.findById(req.params.userId);
    user.isActive = values.activateUser;
    await user.save();
    await db.Post.updateMany(
      { author: user._id },
      { $set: { isAuthorActive: values.activateUser } }
    );
    if (!user.isActive) {
      await db.Reaction.deleteMany({
        $or: [{ user: user._id }],
      }).exec();

      const userMessages = await db.Message.find({ author: user._id }).exec();
      const userMessagesConversationIds = userMessages.map(
        (message) => message.conversation
      );

      const postConversations = await db.Conversation.find({
        _id: { $in: userMessagesConversationIds },
      }).exec();
      const postConversationsIds = postConversations.map(
        (conversation) => conversation._id
      );

      await db.Message.deleteMany({
        conversation: { $in: postConversationsIds },
      }).exec();
      await db.Conversation.deleteMany({
        _id: { $in: postConversationsIds },
      }).exec();

      const usersFromConversations = new Set();
      postConversations.forEach((conversation) => {
        usersFromConversations.add(conversation.postAuthor);
        usersFromConversations.add(conversation.user);
      });
      usersFromConversations.forEach((user) => {
        io.emit(`conversations updated ${user}`);
      });
    }
  } catch (err) {
    errors.push(
      "A fost o problemă când am încercat să dezactivăm/activăm utilizatorul"
    );
  }

  res.send({ success: !errors.length, errors: errors });
});

app.delete("/deleteUser/:userId", verifyToken, async (req, res) => {
  const errors = [];
  const values = req.body;

  try {
    //insert into db
    const currentUser = await getUserFromToken(req.token);

    if (
      req.params.userId === currentUser._id.toString() ||
      !currentUser.role.isAdmin
    ) {
      // Forbidden
      res.sendStatus(403);
      return;
    }
    const user = await db.User.findById(req.params.userId);
    user.profileImage && deleteImages([user.profileImage]);
    const posts = await db.Post.find({ author: user._id })
      .select({ images: true })
      .exec();
    const postsImages = posts.map((post) => post.images).flat();
    const postsIds = posts.map((post) => post._id);
    deleteImages(postsImages);
    await db.Post.deleteMany({ author: user._id });
    await db.User.deleteOne({ _id: user._id });
    await db.Reaction.deleteMany({
      $or: [{ user: user._id }, { post: { $in: postsIds } }],
    }).exec();

    const userMessages = await db.Message.find({ author: user._id }).exec();
    const userMessagesConversationIds = userMessages.map(
      (message) => message.conversation
    );

    const postConversations = await db.Conversation.find({
      _id: { $in: userMessagesConversationIds },
    }).exec();
    const postConversationsIds = postConversations.map(
      (conversation) => conversation._id
    );

    await db.Message.deleteMany({
      conversation: { $in: postConversationsIds },
    }).exec();
    await db.Conversation.deleteMany({
      _id: { $in: postConversationsIds },
    }).exec();

    const usersFromConversations = new Set();
    postConversations.forEach((conversation) => {
      usersFromConversations.add(conversation.postAuthor);
      usersFromConversations.add(conversation.user);
    });
    usersFromConversations.forEach((user) => {
      io.emit(`conversations updated ${user}`);
    });
  } catch (err) {
    errors.push("A fost o problemă când am încercat să ștergem utilizatorul");
  }

  res.send({ success: !errors.length, errors: errors });
});
app.get(`/reactions/:postId`, async (req, res) => {
  try {
    const reactions = await db.Reaction.find({
      post: req.params.postId,
    })
      .sort({ date: -1 })
      .populate("user")
      .exec();

    res.send({ success: true, reactions: reactions });
  } catch (err) {
    res.send({ success: false });
  }
});

app.post("/reaction/:postId", verifyToken, async (req, res) => {
  //validari + adaugare bd
  const values = req.body;
  const errors = [];

  try {
    //insert into db
    const user = await getUserFromToken(req.token);
    if (!user) {
      throw new Error("Nu a fost găsit userul");
    }
    const reaction = await db.Reaction.findOne({
      post: req.params.postId,
      user: user._id,
    }).exec();
    if (reaction) {
      if (reaction.type === values.reactionType) {
        await db.Reaction.deleteOne({ _id: reaction._id });
      } else {
        reaction.type = values.reactionType;
        reaction.date = Date.now();
        await reaction.save();
      }
    } else {
      const reaction = new db.Reaction();
      reaction.type = values.reactionType;
      reaction.post = req.params.postId;
      reaction.user = user._id;

      await reaction.save();
    }
  } catch (err) {
    errors.push("A fost o problemă când am încercat să adăugam reacție!");
  }

  res.send({ success: !errors.length, errors: errors });
});

app.get(`/recommendations`, verifyToken, async (req, res) => {
  try {
    const user = await getUserFromToken(req.token);
    if (user) {
      const recommender = new jsrecommender.Recommender({
        alpha: 0.01, // learning rate
        lambda: 0.0, // regularization parameter
        iterations: 500, // maximum number of iterations in the gradient descent algorithm
        kDim: 5, // number of hidden features for each post
      });

      const table = new jsrecommender.Table();

      const userReactions = await db.Reaction.find({ user: user._id }).exec();

      if (!userReactions.length) {
        res.send({ success: false });
        return;
      }

      const userReactionsPostIds = userReactions.map(
        (reaction) => reaction.post
      );
      const otherUsersReactions = await db.Reaction.find({
        post: { $in: userReactionsPostIds },
      }).exec();
      const otherUsersReactionsUserIds = otherUsersReactions.map(
        (reaction) => reaction.user
      );

      const reactions = await db.Reaction.find({
        user: { $in: otherUsersReactionsUserIds },
      })
        .populate(["post"])
        .exec();

      reactions.forEach((reaction) => {
        if (
          !reaction.post.wasAdopted &&
          !reaction.post.isArchived &&
          reaction.post.isAuthorActive
        ) {
          let score;
          switch (reaction.type) {
            case "like":
              score = 1;
              break;
            case "love":
              score = 2;
              break;
            default:
              score = 0;
          }
          table.setCell(
            reaction.post._id.toString(),
            reaction.user.toString(),
            score
          );
        }
      });

      recommender.fit(table);

      const predicted_table = recommender.transform(table);

      const recommendedPostsWithScores = [];

      for (let j = 0; j < predicted_table.rowNames.length; ++j) {
        const post = predicted_table.rowNames[j];
        console.log("aici = ", post);
        const score = Math.round(
          predicted_table.getCell(post, user._id.toString())
        );
        score > 0 &&
          recommendedPostsWithScores.push({
            postId: post,
            score: score,
          });
        // console.log(
        //   "Post [" +
        //     post +
        //     "] has actual rating of " +
        //     Math.round(table.getCell(post, user._id.toString()))
        // );
        // console.log(
        //   "Post [" +
        //     post +
        //     "] is predicted to have rating " +
        //     predicted_table.getCell(post, user._id.toString())
        // );
      }

      recommendedPostsWithScores.sort((a, b) => {
        return b.score - a.score;
      });
      console.log("---------------------------", recommendedPostsWithScores);
      const postsSlice = recommendedPostsWithScores
        .slice(0, 4)
        .map((recPost) => recPost.postId);

      const recommendedPosts = await db.Post.find({
        _id: {
          $in: postsSlice,
        },
      })
        .populate(["author", "breed"])
        .exec();

      res.send({
        success: true,
        recommendedPosts: postsSlice.map((post) =>
          recommendedPosts.find((recPost) => recPost._id.toString() === post)
        ),
      });
    }
  } catch (err) {
    console.log(err);
    res.send({ success: false });
  }
});

app.get(`/conversation/:postId`, verifyToken, async (req, res) => {
  try {
    const user = await getUserFromToken(req.token);
    if (!user) {
      // Forbidden
      res.sendStatus(403);
      return;
    }

    let conversation = await db.Conversation.findOne({
      post: req.params.postId,
      user: user._id,
    }).exec();
    if (!conversation) {
      conversation = new db.Conversation();
      conversation.user = user._id;
      conversation.post = req.params.postId;
      conversation.date = Date.now();
      const post = await db.Post.findById(req.params.postId).exec();
      if (!post || user._id.equals(post.author)) {
        throw new Error();
      }
      conversation.postAuthor = post.author;
      await conversation.save();
    }
    res.send({ success: true, conversationId: conversation._id });
  } catch (err) {
    res.send({ success: false });
  }
});
app.get(`/admin/userStatistics`, verifyToken, async (req, res) => {
  try {
    const user = await getUserFromToken(req.token);
    if (!user.role.isAdmin) {
      // Forbidden
      res.sendStatus(403);
      return;
    }

    const userCount = await db.User.aggregate([
      {
        $match: {
          date: { $gte: new Date(`1 Jan ${new Date().getFullYear()}`) },
        },
      },
      {
        $project: { month: { $month: "$date" } },
      },
    ])
      .group({ _id: `$month`, count: { $sum: 1 } })
      .sort({ _id: "asc" })
      .exec();

    const userStatistics = userCount.map((monthData) => {
      return [
        new Date(`${monthData._id} 10 ${new Date().getFullYear()}`),
        monthData.count,
      ];
    });
    res.send({ success: true, userStatistics: userStatistics });
  } catch (err) {
    res.send({ success: false });
  }
});

app.get(`/admin/postStatistics`, verifyToken, async (req, res) => {
  try {
    const user = await getUserFromToken(req.token);
    if (!user.role.isAdmin) {
      // Forbidden
      res.sendStatus(403);
      return;
    }

    const postCount = await db.Post.aggregate([
      {
        $match: {
          date: { $gte: new Date(`1 Jan ${new Date().getFullYear()}`) },
        },
      },
      {
        $project: { month: { $month: "$date" } },
      },
    ])
      .group({ _id: `$month`, count: { $sum: 1 } })
      .sort({ _id: "asc" })
      .exec();

    const postStatistics = postCount.map((monthData) => {
      return [
        new Date(`${monthData._id} 10 ${new Date().getFullYear()}`),
        monthData.count,
      ];
    });
    res.send({
      success: true,
      postStatistics: postStatistics,
    });
  } catch (err) {
    res.send({ success: false });
  }
});

app.get(`/admin/generalStatistics`, verifyToken, async (req, res) => {
  try {
    const user = await getUserFromToken(req.token);
    if (!user.role.isAdmin) {
      // Forbidden
      res.sendStatus(403);
      return;
    }

    const [
      totalUsers,
      activeUsers,
      totalPosts,
      hiddenPosts,
      adoptedPosts,
      totalReactions,
      likes,
      dislikes,
      loves,
    ] = await Promise.all([
      db.User.count().exec(),
      db.User.count({ isActive: true }).exec(),
      db.Post.count().exec(),
      db.Post.count({
        $or: [{ isArchived: true }, { isAuthorActive: false }],
      }).exec(),
      db.Post.count({
        wasAdopted: true,
        isArchived: false,
        isAuthorActive: true,
      }).exec(),
      db.Reaction.count().exec(),
      db.Reaction.count({ type: "like" }).exec(),
      db.Reaction.count({ type: "dislike" }).exec(),
      db.Reaction.count({ type: "love" }).exec(),
    ]);
    res.send({
      success: true,
      userStats: { totalUsers: totalUsers, activeUsers: activeUsers },
      postStats: { totalPosts, hiddenPosts, adoptedPosts },
      reactionStats: { totalReactions, likes, dislikes, loves },
    });
  } catch (err) {
    res.send({ success: false });
  }
});

server.listen(port, () => {
  console.log("listening on port", port);
});

// socket calls
io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });

  socket.on("get conversations", async (token, cb) => {
    try {
      const user = await getUserFromToken(token);
      const conversations = await db.Conversation.find({
        $or: [{ user: user._id }, { postAuthor: user._id }],
      })
        .sort({ lastUpdate: "desc" })
        .populate(["post", "user", "postAuthor"])
        .exec();
      cb({ success: true, conversations: conversations });
    } catch (err) {
      cb({ success: false });
    }
  });

  socket.on("get messages", async (token, conversationId, cb) => {
    try {
      const user = await getUserFromToken(token);
      const conversation = await db.Conversation.findById(
        conversationId
      ).exec();

      if (
        !user ||
        !conversation ||
        (!conversation.postAuthor.equals(user._id) &&
          !conversation.user.equals(user._id))
      ) {
        throw new Error("conversation not found");
      }
      const messages = await db.Message.find({
        conversation: conversation._id,
      })
        .populate(["author"])
        .sort({ date: "asc" })
        .exec();

      cb({ success: true, messages: messages });
    } catch (err) {
      cb({ success: false });
    }
  });
  socket.on(
    "send conversation message",
    async (conversationId, messageContent, token, cb) => {
      try {
        const user = await getUserFromToken(token);
        const conversation = await db.Conversation.findById(
          conversationId
        ).exec();
        if (
          !user ||
          !conversation ||
          (!conversation.postAuthor.equals(user._id) &&
            !conversation.user.equals(user._id))
        ) {
          throw new Error("user/ conversation /not part of the conversation");
        }

        const message = new db.Message();
        message.content = messageContent;
        message.author = user._id;
        message.conversation = conversation._id;

        const error = message.validateSync();
        const errors = [];

        error &&
          errors.push(
            ...Object.values(error.errors).map((error) => error.message)
          );

        if (errors.length) {
          cb({ success: false, errors: errors });
          return;
        }
        await message.save();
        conversation.lastUpdate = message.date;
        await conversation.save();

        const populatedMessage = await db.Message.findById(message._id)
          .populate(["author"])
          .exec();
        io.emit(`new conversation message ${conversationId}`, populatedMessage);
        io.emit(`conversations updated ${conversation.postAuthor}`);
        io.emit(`conversations updated ${conversation.user}`);
      } catch (error) {
        cb({ success: false, errors: ["Nu s-a putut trimite mesajul"] });
      }
    }
  );
});
